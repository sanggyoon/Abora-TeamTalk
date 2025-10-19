from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.modules.tts.router import router as tts_router

app = FastAPI()

# TTS 라우터 등록
app.include_router(tts_router)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙 설정
app.mount("/public", StaticFiles(directory="public"), name="public")

@app.get("/")
def read_root():
    return {"message": "TeamTalk TTS Backend API"}
