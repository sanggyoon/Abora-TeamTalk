# 07. 실행 및 배포

> [← 06. 데이터 모델](06-data-model.md) · [문서 인덱스](../README.md)

---

## 1. 시작하기 전에 — 무엇이 필요한가

TeamTalk은 **6개 구성요소가 모두 살아 있어야** 완전히 동작합니다.

| 구성요소 | 이 리포지토리에 있나 | 없으면 어떻게 되나 |
| --- | --- | --- |
| Next.js 프론트엔드 | ✅ `FrontEnd/abora_front/` | — |
| FastAPI TTS 백엔드 | ✅ `BackEnd/` | 음성·립싱크 없이 텍스트만 |
| **n8n 워크플로** | ❌ 외부 인스턴스 | **대화 자체가 불가능** |
| **Ollama + 역할 모델** | ❌ 외부 | n8n이 응답을 생성 못 함 |
| **Supabase** | ❌ 외부 인스턴스 | 로그인·세션 생성 불가 |
| Google Cloud TTS API 키 | ❌ 발급 필요 | 음성 생성 불가 |

> ⚠️ **이 리포지토리만으로는 전체 시스템을 실행할 수 없습니다.** n8n 워크플로는 인스턴스 안에 존재하고(export JSON이 리포지토리에 없음), Ollama 모델과 Supabase 스키마도 별도 구축이 필요합니다.
>
> 리포지토리 코드만으로 확인 가능한 범위는 **② 프론트엔드 화면·3D 아바타 렌더링**과 **③ TTS/립싱크 파이프라인**입니다.

### 사전 요구사항

| | 버전 | 비고 |
| --- | --- | --- |
| Node.js | 18.18+ (권장 20+) | Next.js 15 요구사항 |
| Python | 3.9+ | FastAPI + faster-whisper |
| npm | 9+ | |
| 브라우저 | WebGL 지원 | 3D 아바타 렌더링 |

---

## 2. 로컬 실행

### 2-1. 백엔드 (TTS)

```bash
cd BackEnd

python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

pip install -r requirements.txt

# 출력 디렉터리가 없으면 생성 (코드가 자동 생성하지 않음)
mkdir -p public/tts public/json

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**확인**

```bash
curl http://localhost:8000/
# → {"message":"TeamTalk TTS Backend API"}
```

API 문서: <http://localhost:8000/docs>

**주의사항**

| | |
| --- | --- |
| 🔴 **반드시 `BackEnd/` 에서 실행** | `StaticFiles(directory="public")`와 `f"public/tts/{filename}"`이 상대 경로입니다. 다른 디렉터리에서 실행하면 파일 저장·서빙이 전부 실패합니다 |
| 🟡 **첫 실행이 느립니다** | faster-whisper `base` 모델(~140MB)을 자동 다운로드합니다 |
| 🟡 **포트 8000 고정** | 프론트엔드가 `http://localhost:8000`을 하드코딩하고 있어 변경 불가 (아래 4절 참고) |

### 2-2. 프론트엔드

```bash
cd FrontEnd/abora_front
npm install
```

> 🔴 **`hangul-js` 설치가 별도로 필요합니다.**
>
> 립싱크 핵심 의존성인 `hangul-js`가 `abora_front/package.json`이 아니라 **상위 `FrontEnd/package.json`**에 선언되어 있습니다. `abora_front`에서만 `npm install`하면 다음 파일들이 모듈을 찾지 못해 빌드가 깨집니다.
> - `src/app/Components/Avatar/motion/ModelController.tsx`
> - `src/app/utils/playAudioWithLipSync.ts`
>
> ```bash
> # abora_front 안에서
> npm install hangul-js
> ```
>
> 또는 상위에서 먼저 설치:
> ```bash
> cd FrontEnd && npm install && cd abora_front && npm install
> ```
>
> 근본적인 해결은 `abora_front/package.json`에 의존성을 옮기는 것입니다 ([08. 알려진 이슈](08-known-issues.md#5-hangul-js-의존성-위치-오류) 참고).

환경 변수 파일을 만듭니다.

```bash
# FrontEnd/abora_front/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-host>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_API_URL=https://<your-n8n-host>
NEXT_PUBLIC_TTS_API_URL=http://localhost:8000
```

개발 서버 실행:

```bash
npm run dev
# → http://localhost:3000
```

### 2-3. 실행 스크립트

| 명령 | 동작 |
| --- | --- |
| `npm run dev` | 개발 서버 (localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint 검사 |

---

## 3. 환경 변수

### 프론트엔드 — `FrontEnd/abora_front/.env.local`

| 변수 | 용도 | 사용 위치 | 상태 |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 엔드포인트 | `src/lib/supabase.ts` | ✅ 사용 중 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 | `src/lib/supabase.ts` | ✅ 사용 중 |
| `NEXT_PUBLIC_API_URL` | **n8n 호스트** | `fetchChat.ts`, `chat-proxy.ts` | ✅ 사용 중 |
| `NEXT_PUBLIC_TTS_API_URL` | TTS 백엔드 호스트 | — | ⚠️ **정의만 되어 있고 미사용** |

> `NEXT_PUBLIC_API_URL`은 이름과 달리 **n8n 호스트**입니다. 코드에서 `${NEXT_PUBLIC_API_URL}/webhook/expert-models` 형태로 쓰이므로, 값에 `/webhook` 경로를 포함하면 안 됩니다.

> 🚨 `NEXT_PUBLIC_*` 접두사가 붙은 변수는 **브라우저 번들에 그대로 포함**됩니다. Supabase anon key는 공개를 전제로 한 키이므로 문제없지만, 이 구조는 **RLS 정책이 반드시 설정되어 있어야** 안전합니다 ([06. 데이터 모델](06-data-model.md#7-스키마-평가) 참고).

### 백엔드 — `BackEnd/.env`

| 변수 | 용도 |
| --- | --- |
| `GOOGLE_TTS_API_KEY` | Google Cloud Text-to-Speech API 키 |

**발급 방법**
1. Google Cloud Console에서 프로젝트 생성
2. **Cloud Text-to-Speech API** 활성화
3. 사용자 인증 정보 → API 키 생성
4. (권장) API 키에 Text-to-Speech API 제한 적용

> 두 `.env` 파일 모두 **git에 추적되지 않습니다.** 확인:
> ```bash
> git ls-files | grep -i "\.env"   # 결과 없음
> ```

---

## 4. 하드코딩된 URL 문제

> 🔴 **로컬이 아닌 환경에서 실행하려면 반드시 수정해야 합니다.**

TTS 관련 URL 3곳이 `http://localhost:8000`으로 하드코딩되어 있습니다.

| 파일 | 라인 위치 | 하드코딩된 URL |
| --- | --- | --- |
| `src/app/ConversationRoom/utils/fetchTTS.tsx` | `fetch(...)` | `http://localhost:8000/tts/speak` |
| `src/app/Components/Avatar/motion/ModelController.tsx` | `fetch(...)` | `http://localhost:8000/tts/json/${jsonFilename}` |
| `src/app/Components/Avatar/motion/ModelController.tsx` | `new Audio(...)` | `http://localhost:8000/public/tts/${mp3Filename}` |
| `src/app/utils/playAudioWithLipSync.ts` | (미사용 파일) | 동일 |

`.env.local`에 `NEXT_PUBLIC_TTS_API_URL`이 정의되어 있으므로, **환경 변수로 치환하면 해결됩니다.**

```ts
// 수정 예시
const TTS_BASE = process.env.NEXT_PUBLIC_TTS_API_URL ?? 'http://localhost:8000';

const res = await fetch(`${TTS_BASE}/tts/speak`, { ... });
```

> 브라우저에서 실행되는 코드이므로, 이 값은 **브라우저가 도달할 수 있는 주소**여야 합니다. 서버 내부 주소(`http://backend:8000`)를 넣으면 안 됩니다.

---

## 5. 외부 의존성 구축

리포지토리에 포함되지 않은 구성요소를 직접 준비해야 합니다.

### 5-1. Supabase

셀프호스팅 또는 Supabase Cloud 프로젝트를 준비하고, [06. 데이터 모델](06-data-model.md)의 스키마를 생성합니다.

**필요한 것**
- 커스텀 ENUM 타입 2종 — `role_type`, `scenario_type`
- 테이블 4개 — `users`, `sessions`, `conversations`, `n8n_chat_histories`
  - `n8n_chat_histories`는 n8n Memory 노드가 자동 생성하므로 직접 만들지 않아도 됩니다
- Supabase Auth 이메일/비밀번호 로그인 활성화
- **RLS 정책** — 프론트엔드가 anon key로 직접 접근하므로 필수

```sql
CREATE TYPE role_type AS ENUM ('사용자', '개발자', '기획자', '디자이너');
CREATE TYPE scenario_type AS ENUM ('시나리오1', '시나리오2', '시나리오3');
```

> 위 ENUM 정의는 [스키마 이미지](img/teamtalk-DB%20구조.png)와 코드에서 저장하는 값을 근거로 재구성한 것입니다. 실제 마이그레이션 파일은 리포지토리에 없습니다.

### 5-2. Ollama + 역할 모델

```bash
# macOS
brew install ollama
ollama serve
```

역할별 모델(Qwen / Llama / Mistral 7~8B + LoRA)을 준비해 Ollama에 등록합니다. LoRA 어댑터와 학습 데이터는 이 리포지토리에 없습니다.

> **메모리 주의**: 7~8B 모델을 여러 개 동시에 상주시키면 16GB 환경에서 스와핑이 발생합니다. 운영 당시에는 lazy load + 직렬 큐로 대응했습니다 ([02. 아키텍처](02-architecture.md#5-성능-5분--3분) 참고).

### 5-3. n8n 워크플로

n8n 인스턴스를 구축하고 [05. n8n 워크플로](05-n8n-workflow.md)의 구조에 따라 워크플로를 구성합니다.

**구성해야 할 것**
- Webhook 노드 — 경로 `expert-models`, POST
- OPTIONS 분기 (CORS preflight 대응)
- Supabase / Postgres 노드 — `conversations` INSERT/SELECT
- 오케스트레이터 AI Agent — OpenAI Chat Model + Structured Output Parser + Postgres Chat Memory
- 역할 에이전트 6개 (3직군 × 2라운드) — 각각 Ollama Chat Model 연결
- Switch 노드 2개 — 오케스트레이터 판단 결과로 라우팅
- Code 노드 — 응답 포맷팅
- Respond to Webhook 노드

**필요한 자격 증명**
- OpenAI API 키 (오케스트레이터용)
- Ollama 호스트 주소
- Postgres/Supabase 접속 정보

> ⚠️ 워크플로 export JSON이 리포지토리에 없어, 위 구성은 스크린샷 기반 재구성입니다. 노드별 프롬프트와 파라미터는 별도로 작성해야 합니다.

---

## 6. 부분 실행 시나리오

전체 스택을 갖추기 어려울 때 어디까지 확인할 수 있는지 정리했습니다.

### A. 프론트엔드만 (Supabase / n8n / TTS 없음)

```bash
cd FrontEnd/abora_front && npm run dev
```

| 확인 가능 | 확인 불가 |
| --- | --- |
| 랜딩 화면, 애니메이션 | 로그인 (Supabase 필요) |
| 3D 아바타 렌더링 | 온보딩 진행 (인증 가드에 막힘) |
| 시나리오·동료 카드 UI | 대화 |

> `/OnboardingFirstPage`가 진입 시 `supabase.auth.getSession()`을 검사해 세션이 없으면 `/login`으로 보냅니다. Supabase 없이는 온보딩 이후로 진행할 수 없습니다.

### B. 프론트엔드 + TTS 백엔드 (n8n 없음)

TTS 파이프라인만 독립적으로 검증할 수 있습니다.

```bash
curl -X POST http://localhost:8000/tts/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"안녕하세요, 저는 Soni입니다.","voice":"ko-KR-Wavenet-B"}'

# → {"filename":"tts_xxx.mp3","json":"tts_xxx.json"}

curl http://localhost:8000/tts/json/tts_xxx.json
# → [{"start":0.0,"end":2.1,"text":" 안녕하세요, 저는 Soni입니다."}]
```

Google TTS API 키만 있으면 **음성 생성과 Whisper 타이밍 추출을 끝까지 확인**할 수 있습니다.

### C. 프론트엔드 + Supabase (n8n 없음)

로그인부터 세션 생성까지 확인 가능합니다. `ConversationRoom`에 진입해 3D 아바타 2명이 렌더링되는 것까지 볼 수 있고, 메시지를 보내면 n8n 호출에서 실패합니다.

---

## 7. 운영 당시 배포 구성

> 아래는 프로젝트 진행 기간(2025)의 실제 배포 형태입니다. **현재 리포지토리 코드는 이 구성으로 바로 배포할 수 없습니다** (4절의 하드코딩 문제).

```
                    인터넷
                      │
                      │ DNS: 도메인 → 홈서버 공인 IP
                      ↓
      ┌───────────────────────────────────────────┐
      │        Mac mini M4 / 16GB (홈서버)          │
      │                                           │
      │  ┌─────────────────────────────────────┐  │
      │  │   Nginx      :443 (HTTPS) / :80     │  │
      │  │   · TLS 종료 · SSL 인증서 발급        │  │
      │  │   · 호스트/경로 기준 라우팅            │  │
      │  └──┬────────┬─────────┬───────────────┘  │
      │     ↓        ↓         ↓                  │
      │  [Next.js] [n8n]  [Supabase]              │
      │   Docker   Docker   Docker                │
      │              │        │                   │
      │              └───┬────┘                   │
      │                  ↓  (호스트 내부 통신)      │
      │             [Ollama]  ← on-premise        │
      │             [FastAPI] ← Docker            │
      └───────────────────────────────────────────┘
```

| 항목 | 구성 |
| --- | --- |
| 하드웨어 | Mac mini M4 / 16GB — 단일 머신 |
| 진입점 | DNS → 홈서버 → Nginx가 443/80 종단 |
| TLS | Nginx에서 인증서 발급 및 종료 |
| 컨테이너 | Next.js, n8n, Supabase, FastAPI, Nginx |
| 비컨테이너 | **Ollama** — macOS Metal(GPU) 가속을 쓰기 위해 호스트에 직접 설치 |
| n8n → DB | n8n 내장 Postgres 노드로 직접 연결. 같은 호스트라 외부 노출 불필요 |
| **CI/CD** | **없음.** GitHub push 후 SSH/VNC 접속 → `git pull` 수동 반영 |

> 🔴 **인프라 코드(docker-compose, Nginx 설정, 배포 스크립트)는 이 리포지토리에 없습니다.** 위 구성은 문서로만 남아 있습니다.

### 수동 배포의 문제

`git pull`로 반영하는 방식은 반복적이고 실수 여지가 큽니다.
- 배포 시점에 어떤 커밋이 올라갔는지 추적이 어려움
- 롤백 절차가 없음
- 빌드 실패가 서비스 중단으로 직결
- 여러 서비스의 배포 순서를 사람이 기억해야 함

이 불편함이 이후 GitHub Actions / Argo CD 기반 자동화를 학습하게 된 직접적 계기였습니다.

### 보안 수준

> 🚨 **솔직한 기록**: 운영 당시 보안은 최소한이었습니다.
>
> - 홈서버를 공인 IP로 직접 노출
> - Bastion 호스트, 방화벽 정책, 보안 그룹 등 계층 방어 없음
> - CORS 전체 허용 (`allow_origins=["*"]`)
> - 비밀번호 평문 저장
>
> 개인 졸업작품이라는 맥락에서 보안까지 챙길 여유가 없었습니다. 이 부족함은 이후 기업 환경(비표준 포트 운영·문서화)과 클라우드 환경(Bastion·보안 그룹)에서 실무 기준을 접하며 메웠습니다.

---

## 8. 트러블슈팅

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `Cannot find module 'hangul-js'` | 의존성이 상위 package.json에 선언됨 | `abora_front`에서 `npm install hangul-js` |
| 백엔드에서 `FileNotFoundError` | `BackEnd/` 밖에서 실행 | `cd BackEnd` 후 uvicorn 실행 |
| `public/tts` 저장 실패 | 디렉터리 없음 | `mkdir -p public/tts public/json` |
| 음성이 재생되지 않음 | TTS 백엔드 미실행 또는 포트 불일치 | 백엔드를 8000 포트로 실행 |
| 3D 아바타가 안 보임 | GLB 로딩 실패 / WebGL 미지원 | 브라우저 콘솔 확인, `public/models/*.glb` 존재 확인 |
| 아바타가 렌더링되다 사라짐 | WebGL context lost | 자동 복구 로직이 있으나 GPU 부하가 크면 반복될 수 있음 |
| 로그인 후 계속 `/login`으로 돌아감 | Supabase 세션 미생성 | `.env.local`의 URL/키 확인 |
| 메시지 전송 시 "세션 정보가 없습니다" | localStorage에 `chatSession` 없음 | 온보딩을 처음부터 다시 진행 |
| 에이전트 응답이 사용자 말풍선으로 표시 | `ai_role` 한글 표기 불일치 | n8n 응답의 `ai_role` 값과 `mapKorean.ts` 매핑 대조 |
| n8n 호출이 CORS 오류 | preflight 미처리 | n8n 워크플로에 OPTIONS 분기 확인 |
| 응답이 8분 넘게 안 옴 | `AbortController` 타임아웃 | Ollama 모델 로딩 상태·큐 길이 확인 |

---

## 9. 실행 체크리스트

```
□ Node.js 18.18+ / Python 3.9+ 설치
□ BackEnd/.env 에 GOOGLE_TTS_API_KEY 설정
□ BackEnd/public/tts, BackEnd/public/json 디렉터리 생성
□ BackEnd 에서 uvicorn 실행 (포트 8000)
□ FrontEnd/abora_front/.env.local 작성 (4개 변수)
□ abora_front 에서 npm install + npm install hangul-js
□ Supabase 인스턴스 준비 + 스키마 생성 + RLS 정책
□ Ollama 실행 + 역할 모델 등록
□ n8n 인스턴스 + 워크플로 구성 (webhook: expert-models)
□ npm run dev → http://localhost:3000
```

---

| ← | → |
| --- | --- |
| [06. 데이터 모델](06-data-model.md) | [08. 알려진 이슈](08-known-issues.md) |
