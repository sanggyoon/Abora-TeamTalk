from faster_whisper import WhisperModel
from pydub import AudioSegment, silence
import json

# 1. Whisper 모델
model = WhisperModel("tiny", device="cpu", compute_type="int8")

def analyze_whisper(mp3_path: str, output_json_path: str,
                    min_silence_len=50, silence_thresh=-40):
    """
    MP3 분석 후, 모든 무음을 빈 text 세그먼트로 JSON에 반영
    - min_silence_len: 최소 묵음 길이(ms)
    - silence_thresh: 묵음 판단 기준(dBFS)
    """

    # 1️⃣ MP3 로드 및 무음 감지
    audio = AudioSegment.from_mp3(mp3_path)
    silent_ranges = silence.detect_silence(audio, min_silence_len=min_silence_len,
                                           silence_thresh=silence_thresh)
    # ms -> sec
    silent_ranges = [[s/1000.0, e/1000.0] for s, e in silent_ranges]

    # 2️⃣ Whisper 세그먼트 분석
    segments, _ = model.transcribe(mp3_path, language="ko")

    results = []
    current_time = 0.0
    silent_idx = 0

    for seg in segments:
        seg_start, seg_end = seg.start, seg.end

        # 🔹 세그먼트 시작 전 남은 무음 처리
        while silent_idx < len(silent_ranges):
            s_start, s_end = silent_ranges[silent_idx]
            if s_start >= current_time and s_start < seg_start:
                # 무음 구간이 세그먼트 시작 전이면 JSON에 추가
                results.append({
                    "start": round(s_start, 2),
                    "end": round(min(s_end, seg_start), 2),
                    "text": ""
                })
                current_time = max(current_time, s_end)
                silent_idx += 1
            else:
                break

        # 🔹 Whisper 세그먼트 추가
        if seg_end > current_time:
            results.append({
                "start": round(seg_start, 2),
                "end": round(seg_end, 2),
                "text": seg.text.strip()
            })
            current_time = seg_end

    # 3️⃣ 마지막 남은 무음 처리 (세그먼트 끝 이후)
    audio_end = len(audio) / 1000.0
    while silent_idx < len(silent_ranges):
        s_start, s_end = silent_ranges[silent_idx]
        if s_start >= current_time and s_end <= audio_end:
            results.append({
                "start": round(s_start, 2),
                "end": round(s_end, 2),
                "text": ""
            })
        silent_idx += 1

    # 4️⃣ JSON 저장
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("분석 완료! 모든 묵음 반영 JSON 생성됨")
    return results
