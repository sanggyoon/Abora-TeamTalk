# TeamTalk Backend - TTS Service

## 소개
TeamTalk 프로젝트의 TTS(Text-to-Speech) 백엔드 서비스입니다.

## 기능
- Google Cloud TTS API를 사용한 텍스트 음성 변환
- Whisper 모델을 사용한 음성 분석 및 립싱크 타이밍 데이터 생성
- MP3 및 JSON 파일 관리

## 설치 방법

### 1. 가상환경 생성 및 활성화
```bash
cd BackEnd
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate  # Windows
```

### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

### 3. 환경변수 설정
`.env` 파일이 이미 생성되어 있으며, Google TTS API 키가 설정되어 있습니다.

### 4. 서버 실행
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API 엔드포인트

### 1. TTS 생성
```
POST /tts/speak
Content-Type: application/json

{
  "text": "변환할 텍스트",
  "voice": "ko-KR-Wavenet-A"  // 선택사항
}
```

**응답:**
```json
{
  "filename": "tts_xxxxx.mp3",
  "json": "tts_xxxxx.json"
}
```

### 2. JSON 파일 조회
```
GET /tts/json/{filename}
```

### 3. MP3 파일 삭제
```
DELETE /tts/{filename}
```

## 디렉토리 구조
```
BackEnd/
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── modules/
│       └── tts/
│           ├── __init__.py
│           ├── router.py
│           ├── whisper.py
│           └── utils.py
├── public/
│   ├── tts/        # MP3 파일 저장
│   └── json/       # 타이밍 JSON 파일 저장
├── .env
└── requirements.txt
```

## 사용된 기술
- FastAPI
- Google Cloud TTS API
- faster-whisper (Whisper 모델)
- uvicorn

## 주의사항
- 생성된 MP3 및 JSON 파일은 `public/` 디렉토리에 저장됩니다
- Whisper 모델은 첫 실행 시 자동으로 다운로드됩니다
