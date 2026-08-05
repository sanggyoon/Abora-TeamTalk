# 04. 백엔드 (TTS 서비스)

> [← 03. 프론트엔드](03-frontend.md) · [문서 인덱스](../README.md)

**위치**: `BackEnd/`

---

## 1. 이 서비스가 하는 일

TeamTalk의 백엔드는 **음성 생성 전용 서비스**입니다. 대화 로직·에이전트 오케스트레이션·DB 저장은 전부 n8n이 담당하고, 이 서비스는 딱 하나만 합니다.

> **텍스트를 받아 mp3와 립싱크 타이밍 JSON을 만들어 준다.**

```
POST /tts/speak  { text, voice }
        ↓
   Google Cloud TTS  →  mp3 저장
        ↓
   faster-whisper    →  타이밍 JSON 저장
        ↓
   { filename: "tts_xxx.mp3", json: "tts_xxx.json" }
```

**왜 이 두 단계가 필요한가**: Google Cloud TTS는 음성 파일만 반환하고 "언제 어떤 소리가 나는지"는 알려주지 않습니다. 립싱크에는 그 타이밍이 반드시 필요합니다. 그래서 **방금 만든 음성을 다시 STT(Whisper)로 분석해** 구간별 타이밍을 역산합니다. 우회 방법이지만, Google TTS의 한국어 품질을 유지하면서 타이밍을 얻는 현실적인 선택이었습니다.

---

## 2. 기술 구성

| 항목 | 값 |
| --- | --- |
| 프레임워크 | FastAPI 0.115.5 |
| ASGI 서버 | uvicorn[standard] 0.32.1 |
| TTS | **Google Cloud Text-to-Speech REST API** (`requests`로 직접 호출) |
| STT | **faster-whisper 1.1.0** — `base` 모델, CPU, int8 양자화 |
| 환경 변수 | python-dotenv 1.0.1 |

`requirements.txt` 전체가 5줄입니다. Google Cloud SDK도 쓰지 않고 `requests`로 REST를 직접 때립니다 — 의존성을 최소화한 선택입니다.

### Whisper 모델 설정

```python
WhisperModel("base", device="cpu", compute_type="int8")
```

| 설정 | 값 | 이유 |
| --- | --- | --- |
| 모델 크기 | `base` | 정확한 전사가 목적이 아니라 **구간 타이밍**만 필요. 작은 모델로 충분 |
| 디바이스 | `cpu` | Ollama가 GPU(Metal)를 점유. TTS까지 GPU를 쓰면 경합 발생 |
| 양자화 | `int8` | 메모리 사용량 절감 — 16GB 단일 머신 제약 |

`base` + CPU + int8 조합은 **품질보다 자원 절약을 우선한 선택**입니다. 어차피 자모 단위 균등 분배로 근사하기 때문에 전사 정확도가 높을 필요가 없습니다.

---

## 3. 디렉터리 구조

```
BackEnd/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI 앱, CORS, 정적 파일 마운트
│   └── modules/
│       ├── __init__.py
│       └── tts/
│           ├── __init__.py
│           ├── router.py          # ★ /tts 라우터 — 엔드포인트 3종
│           ├── whisper.py         # ★ Whisper 분석 모듈
│           └── utils.py           # (빈 파일)
├── public/
│   ├── tts/                       # 생성된 mp3
│   └── json/                      # 생성된 타이밍 JSON
├── .env                           # GOOGLE_TTS_API_KEY (git 미추적)
├── requirements.txt
└── README.md                      # 기존 백엔드 README
```

> `public/` 아래에 생성된 파일이 **44쌍 커밋되어 있습니다.** 런타임 산출물이라 `.gitignore` 대상이 되어야 하지만, 데모용 샘플로 남겨둔 것으로 보입니다.

---

## 4. 앱 진입점 (`app/main.py`)

```python
app = FastAPI()
app.include_router(tts_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # ⚠️ 전체 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/public", StaticFiles(directory="public"), name="public")
```

**두 가지 짚을 점**

1. **`/public` 정적 마운트**가 있어 브라우저가 `GET /public/tts/{filename}.mp3`로 음성 파일을 직접 가져갈 수 있습니다. 별도 파일 서빙 엔드포인트가 필요 없습니다.
2. 🚨 **CORS가 전체 허용(`allow_origins=["*"]`)입니다.** 게다가 `allow_credentials=True`와 함께 쓰였는데, 이 조합은 브라우저 스펙상 유효하지 않아 credentials 요청은 실제로 거부됩니다. 프론트엔드가 credentials 없이 호출하고 있어 현재는 동작하지만, 배포 시에는 origin을 명시해야 합니다.

**작업 디렉터리 의존성**: `StaticFiles(directory="public")`와 라우터의 `f"public/tts/{filename}"`이 모두 **상대 경로**입니다. 반드시 `BackEnd/` 디렉터리에서 서버를 실행해야 합니다.

---

## 5. API 스펙

Base URL (로컬): `http://localhost:8000`

### `GET /`

헬스체크.

```json
{ "message": "TeamTalk TTS Backend API" }
```

---

### `POST /tts/speak` — TTS 생성 + 타이밍 추출

**요청**

```json
{
  "text": "안녕하세요, 저는 Soni입니다. 잘부탁드립니다!",
  "voice": "ko-KR-Wavenet-B"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `text` | string | ✅ | 음성으로 변환할 텍스트 |
| `voice` | string | — | Google TTS 음성 이름. 기본값 `ko-KR-Wavenet-A` |

`voice`는 프론트엔드가 `RoleConfig`에서 화자의 음성을 골라 보냅니다 ([03. 프론트엔드](03-frontend.md#3-3-srcappconfigroleconfigts--단일-진실-공급원) 참고).

**응답 (200)**

```json
{
  "filename": "tts_e2678776dbbe4286b42155dcf6724ec0.mp3",
  "json":     "tts_e2678776dbbe4286b42155dcf6724ec0.json"
}
```

파일명은 `tts_{uuid4().hex}` 형태이며, mp3와 JSON이 **같은 이름에 확장자만 다릅니다.**

**오류 응답** — ⚠️ 모두 **HTTP 200**으로 나갑니다.

```json
{ "error": "Text is empty." }        // text 누락
{ "error": "TTS request failed." }   // Google TTS 호출 실패
```

프론트엔드는 `res.ok`로만 성공 여부를 판단하므로(`fetchTTS.tsx`), 이 오류들을 성공으로 오인해 `data.json`이 `undefined`인 채로 진행합니다. 상세는 [08. 알려진 이슈](08-known-issues.md#7-tts-오류가-http-200으로-반환)를 참고하십시오.

**처리 흐름** (`router.py`)

```python
# ① Google Cloud TTS REST 호출
url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={GOOGLE_TTS_API_KEY}"
payload = {
    "input":       { "text": text },
    "voice":       { "languageCode": "ko-KR", "name": voice },
    "audioConfig": { "audioEncoding": "MP3" }
}
res = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)

# ② base64 디코딩 후 mp3 저장
audio_bytes = base64.b64decode(res.json()["audioContent"])
filename = f"tts_{uuid.uuid4().hex}.mp3"
with open(f"public/tts/{filename}", "wb") as f:
    f.write(audio_bytes)

# ③ Whisper로 타이밍 추출 → JSON 저장
json_filename = filename.replace(".mp3", ".json")
analyze_whisper(f"public/tts/{filename}", os.path.join("public", "json", json_filename))

return JSONResponse({ "filename": filename, "json": json_filename })
```

> `requests.post`는 **동기 호출**인데 엔드포인트는 `async def`입니다. 이벤트 루프가 Google TTS 응답과 Whisper 분석 동안 블로킹됩니다. 동시 요청 시 처리량이 떨어집니다.

---

### `GET /tts/json/{filename}` — 타이밍 JSON 조회

**요청**

```
GET /tts/json/tts_e2678776dbbe4286b42155dcf6724ec0.json
```

**응답 (200)**

```json
[
  { "start": 0.0,  "end": 5.36,  "text": " 환영합니다. 프로젝트 기획자로서 오늘과 관련된 사항에 대해서 알려드릴게요." },
  { "start": 5.36, "end": 9.2,   "text": " 제가 현재 어떤 프로젝트를 진행하고 있는지 궁금하세요." },
  { "start": 9.2,  "end": 12.48, "text": " 아니면 특정한 질문이나 의견을 공유하고 싶으세요?" }
]
```

**응답 (404)** — 파일 없음

```json
{ "detail": "File not found" }
```

프론트엔드의 `ModelController`가 이 데이터를 받아 자모 단위 타임라인으로 변환합니다.

> ⚠️ **경로 검증이 없습니다.** `filename`을 `os.path.join`에 그대로 넣기 때문에 `../` 같은 경로 조작 문자열이 들어가면 `public/json` 밖의 파일을 읽을 수 있습니다. 상세는 [08. 알려진 이슈](08-known-issues.md#8-경로-순회path-traversal-취약점)를 참고하십시오.

---

### `DELETE /tts/{filename}` — mp3 + JSON 삭제

**요청**

```
DELETE /tts/tts_e2678776dbbe4286b42155dcf6724ec0.mp3
```

mp3 파일명을 받아 **대응하는 JSON도 함께 삭제**합니다.

**응답 (200)**

```json
{ "deleted": ["tts_xxx.mp3", "tts_xxx.json"] }
```

**응답 (404)** — mp3 없음

```json
{ "detail": "MP3 file not found" }
```

> ⚠️ 이 엔드포인트는 **프론트엔드에서 호출되지 않습니다.** 결과적으로 생성된 파일이 계속 쌓입니다. 파일 수명주기 관리는 [08. 알려진 이슈](08-known-issues.md#10-tts-산출물이-정리되지-않음)를 참고하십시오.
>
> 또 이 엔드포인트만 `os.path.dirname(os.path.abspath(__file__))` 기준의 절대 경로를 쓰는데, 다른 두 엔드포인트는 상대 경로를 씁니다. **경로 계산 방식이 일관되지 않습니다.**

---

## 6. Whisper 분석 모듈 (`whisper.py`)

```python
from faster_whisper import WhisperModel
import json

model = WhisperModel("base", device="cpu", compute_type="int8")

def analyze_whisper(mp3_path: str, output_json_path: str):
    segments, _ = model.transcribe(mp3_path, language="ko")

    results = []
    for segment in segments:
        results.append({
            "start": round(segment.start, 2),
            "end":   round(segment.end, 2),
            "text":  segment.text
        })

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("분석 완료! json 생성됨")
    return results
```

**핵심**: `language="ko"`로 언어를 고정합니다. 언어 자동 감지 단계를 건너뛰어 속도를 벌고, 짧은 발화에서 언어를 잘못 감지하는 위험도 없앱니다.

**출력은 문장/구 단위 구간**입니다. 단어나 음소 단위가 아닙니다. faster-whisper는 `word_timestamps=True` 옵션으로 단어 단위 타임스탬프도 지원하지만 여기서는 쓰지 않았습니다. 어차피 프론트엔드에서 자모 단위로 균등 분배하기 때문에 구간 단위로도 충분하다고 본 것입니다.

> ⚠️ **Whisper 모델이 두 번 로드됩니다.** `whisper.py`에서 모듈 레벨로 한 번, `router.py`에서도 `whisper_model = WhisperModel(...)`로 한 번. `router.py`의 인스턴스는 **어디에서도 사용되지 않습니다.** 메모리만 이중으로 점유합니다. 16GB 단일 머신에서는 무시할 수 없는 낭비입니다.

---

## 7. 파일 수명주기

```
POST /tts/speak
    ↓
public/tts/tts_{uuid}.mp3      ← Google TTS 결과
public/json/tts_{uuid}.json    ← Whisper 분석 결과
    ↓
프론트엔드가 GET /tts/json/{...}  +  GET /public/tts/{...}
    ↓
재생 완료
    ↓
❌ 삭제되지 않음 — DELETE 엔드포인트는 있으나 호출되지 않음
```

**현재 리포지토리에 44쌍의 mp3/JSON이 커밋되어 있습니다.** 개발 중 생성된 파일들이 정리되지 않고 남은 것입니다.

**개선 방향** (구현되지 않음)
- 재생 완료 후 프론트엔드가 `DELETE /tts/{filename}` 호출
- 또는 백엔드에 TTL 기반 정리 작업(cron / APScheduler) 추가
- 동일 텍스트 + 음성 조합에 대한 캐싱 — 현재는 같은 문장도 매번 새로 생성

---

## 8. 환경 변수

`BackEnd/.env` (git 미추적)

| 변수 | 설명 |
| --- | --- |
| `GOOGLE_TTS_API_KEY` | Google Cloud Text-to-Speech API 키 |

> ⚠️ **API 키가 URL 쿼리 파라미터로 전달됩니다** (`?key={GOOGLE_TTS_API_KEY}`). Google이 공식 지원하는 방식이지만, 프록시·로그에 키가 남을 수 있습니다. 서비스 계정 인증이 더 안전합니다.

---

## 9. 실행

```bash
cd BackEnd
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**주의사항**

- 반드시 `BackEnd/` 디렉터리에서 실행 (상대 경로 의존)
- `public/tts/`, `public/json/` 디렉터리가 존재해야 함 — 코드가 자동 생성하지 않음
- Whisper `base` 모델은 **첫 실행 시 자동 다운로드**됩니다 (약 140MB)
- API 문서: `http://localhost:8000/docs` (FastAPI 자동 생성)

전체 실행 절차는 [07. 실행 및 배포](07-setup.md)를 참고하십시오.

---

## 10. 설계 평가

| 잘한 점 | 아쉬운 점 |
| --- | --- |
| 책임이 명확 — 음성 생성만 담당 | 오류 처리가 HTTP 상태 코드를 쓰지 않음 |
| 의존성 5개로 최소화 | Whisper 모델 중복 로드 |
| `/public` 정적 마운트로 파일 서빙 단순화 | 경로 계산 방식이 엔드포인트마다 다름 |
| mp3/JSON 파일명 규약으로 짝 관리 용이 | 경로 검증 부재 (path traversal) |
| CPU + int8로 GPU 경합 회피 | `async def` 안의 동기 블로킹 호출 |
| 언어 고정으로 속도·안정성 확보 | 산출물 정리·캐싱 없음 |

**전체적으로는 목적에 맞게 작게 만든 서비스입니다.** TTS는 대화 흐름의 곁가지이므로 여기에 많은 복잡도를 투자하지 않은 판단 자체는 타당합니다. 다만 오류 처리와 경로 검증은 규모와 무관하게 갖췄어야 할 부분입니다.

---

| ← | → |
| --- | --- |
| [03. 프론트엔드](03-frontend.md) | [05. n8n 워크플로](05-n8n-workflow.md) |
