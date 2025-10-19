from faster_whisper import WhisperModel
import json

# 1. Whisper 모델
model = WhisperModel("base", device="cpu", compute_type="int8")

def analyze_whisper(mp3_path: str, output_json_path: str):

    #2. mp3 분석
    segments, _ = model.transcribe(mp3_path, language="ko")

    #3. 결과를 리스트로 반환
    results = []
    for segment in segments:
        results.append({
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text
        })

    #4. json  저장
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("분석 완료! json 생성됨")
    return results  # 분석 데이터도 원하면 반환
