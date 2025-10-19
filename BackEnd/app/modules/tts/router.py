

import os
import base64
import requests
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import uuid
from faster_whisper import WhisperModel
from app.modules.tts.whisper import analyze_whisper


load_dotenv()

router = APIRouter(prefix="/tts", tags=["TTS"])
GOOGLE_TTS_API_KEY = os.getenv("GOOGLE_TTS_API_KEY")

# Whisper 모델 로딩 (전역에서 1회만 로드)
whisper_model = WhisperModel("base", device="cpu", compute_type="int8")

@router.post("/speak")
async def speak(request: Request):
    body = await request.json()
    text = body.get("text", "")
    voice = body.get("voice", "ko-KR-Wavenet-A") #프론트에서 전달받음

    if not text:
        return { "error": "Text is empty." }

    #tts 생성
    url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={GOOGLE_TTS_API_KEY}"
    payload = {
        "input": { "text": text },
        "voice": { "languageCode": "ko-KR", "name": voice },
        "audioConfig": { "audioEncoding": "MP3" }
    }

    res = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
    if res.status_code != 200:
        return { "error": "TTS request failed." }

    audio_base64 = res.json()["audioContent"]
    audio_bytes = base64.b64decode(audio_base64)

    #mp3 파일 경로
    filename = f"tts_{uuid.uuid4().hex}.mp3"
    filepath = f"public/tts/{filename}"


    with open(filepath, "wb") as f:
        f.write(audio_bytes)

    #mp3 파일을 json 파일로 변경 후 json 저장
    json_filename = filename.replace(".mp3", ".json")
    json_path = os.path.join("public", "json", json_filename)

    #whisper 모듈 콜
    analyze_whisper(filepath, json_path)


    return JSONResponse({ "filename": filename, "json" : json_filename })


#json
@router.get("/json/{filename}")
async def get_json(filename: str):
    json_path = os.path.join("public", "json", filename)
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(json_path)


@router.delete("/{filename}")
async def delete_mp3(filename: str):
    global json_filename
    base_dir = os.path.dirname(os.path.abspath(__file__))
    mp3_path = os.path.join(base_dir, "..", "..", "public", "tts", filename)

    # mp3 → json 이름 변환
    if filename.endswith(".mp3"):
        json_filename = filename.replace(".mp3", ".json")
        json_path = os.path.join(base_dir, "..", "..", "public", "json", json_filename)
    else:
        json_path = None

    deleted_files = []

    if os.path.exists(mp3_path):
        os.remove(mp3_path)
        deleted_files.append(filename)
    else:
        raise HTTPException(status_code=404, detail="MP3 file not found")

    if json_path and os.path.exists(json_path):
        os.remove(json_path)
        deleted_files.append(json_filename)

    return {"deleted": deleted_files}
