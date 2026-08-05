# 08. 알려진 이슈 및 개선 로드맵

> [← 07. 실행 및 배포](07-setup.md) · [문서 인덱스](../README.md)

---

이 문서는 **현재 코드베이스의 실제 상태**를 숨기지 않고 기록합니다. 졸업작품이라는 맥락에서 기간·자원 제약으로 남겨둔 부분, 방향 전환 과정에서 생긴 잔존물, 그리고 규모와 무관하게 고쳤어야 할 결함을 구분해 정리했습니다.

## 요약

| # | 이슈 | 심각도 | 분류 |
| --- | --- | --- | --- |
| [1](#1-tailwind-css-미사용) | Tailwind CSS 미사용 (문서와 불일치) | 🟢 낮음 | 문서 불일치 |
| [2](#2-chat-proxy-미사용) | chat-proxy 프록시 미사용 | 🟡 중간 | 잔존 코드 |
| [3](#3-tts-엔드포인트-하드코딩) | TTS 엔드포인트 하드코딩 | 🔴 높음 | 배포 차단 |
| [4](#4-chooseagent-페이지-고립) | ChooseAgent 페이지 고립 | 🟡 중간 | 잔존 코드 |
| [5](#5-hangul-js-의존성-위치-오류) | hangul-js 의존성 위치 오류 | 🔴 높음 | 빌드 차단 |
| [6](#6-비밀번호-평문-저장) | 비밀번호 평문 저장 | 🔴 높음 | 보안 |
| [7](#7-tts-오류가-http-200으로-반환) | TTS 오류가 HTTP 200으로 반환 | 🟡 중간 | 오류 처리 |
| [8](#8-경로-순회path-traversal-취약점) | 경로 순회(Path Traversal) 취약점 | 🔴 높음 | 보안 |
| [9](#9-lora-파인튜닝-효과-미달) | LoRA 파인튜닝 효과 미달 | 🟡 중간 | ML 한계 |
| [10](#10-tts-산출물이-정리되지-않음) | TTS 산출물이 정리되지 않음 | 🟡 중간 | 운영 |
| [11](#11-role-한글-매핑이-두-곳에-중복) | role 한글 매핑 중복 | 🟡 중간 | 유지보수 |
| [12](#12-rls-정책-미확인) | RLS 정책 미확인 | 🔴 높음 | 보안 |
| [13](#13-성능-직렬-큐의-확장-한계) | 직렬 큐의 확장 한계 | 🟡 중간 | 성능 |
| [14](#14-whisper-모델-중복-로드) | Whisper 모델 중복 로드 | 🟢 낮음 | 자원 낭비 |
| [15](#15-세션-없을-때-리다이렉트-비활성화) | 세션 없을 때 리다이렉트 비활성화 | 🟡 중간 | UX |
| [16](#16-워크플로가-버전-관리되지-않음) | n8n 워크플로 버전 관리 부재 | 🟡 중간 | 운영 |
| [17](#17-기타-잔존-코드) | 기타 잔존 코드 | 🟢 낮음 | 정리 |

---

## 코드 불일치 및 잔존물

### 1. Tailwind CSS 미사용

**현상**: `package.json` devDependencies에 `tailwindcss@^4.1.13`, `postcss`, `autoprefixer`가 있지만 **실제로 사용되지 않습니다.**

```bash
$ ls FrontEnd/abora_front | grep -iE "tailwind|postcss"
# (결과 없음)

$ grep -rl "@tailwind\|@apply" FrontEnd/abora_front/src
# (결과 없음)
```

- `tailwind.config.js` 없음
- `postcss.config.js` 없음
- `globals.css`에 `@tailwind` 지시자 없음

실제 스타일링은 전부 **CSS Modules + CSS 커스텀 프로퍼티**입니다.

```css
/* src/app/globals.css */
:root {
  --background: radial-gradient(...);
  --signature: #8c7cff;
  --select-color: #35B4FD;
  --font-size-base: 16px;
}
```

**영향**: 기존 문서 `FrontEnd/PROJECT_TECH_STACK.md`가 Tailwind를 핵심 스택으로 길게 서술하고 있어, 코드를 처음 보는 사람이 혼란을 겪습니다.

**해결**
```bash
npm uninstall tailwindcss postcss autoprefixer
```
사용하지 않는 의존성을 제거하고, `PROJECT_TECH_STACK.md`의 해당 섹션을 정정하거나 이 `docs/`를 가리키도록 수정합니다.

---

### 2. chat-proxy 미사용

**현상**: `src/pages/api/chat-proxy.ts`에 n8n 프록시가 완성되어 있으나, 실제 호출 코드는 이를 경유하지 않고 **브라우저에서 n8n을 직접 호출**합니다.

```ts
// src/app/utils/api/fetchChat.ts  — 실제로 쓰이는 코드
const targetUrl = `${process.env.NEXT_PUBLIC_API_URL}/webhook/expert-models`;
const res = await fetch(targetUrl, { ... });   // 브라우저 → n8n 직접
```

```ts
// src/pages/api/chat-proxy.ts  — 존재하지만 호출되지 않음
const targetUrl = `${process.env.NEXT_PUBLIC_API_URL}/webhook/expert-models`;
const response = await fetch(targetUrl, { ... });   // 서버 → n8n
```

**영향**

| | 현재 (직접 호출) | 프록시 경유 시 |
| --- | --- | --- |
| CORS | preflight 발생 → n8n에 OPTIONS 분기 필요 | **same-origin이라 CORS 없음** |
| n8n 주소 | 브라우저 번들에 노출 (`NEXT_PUBLIC_*`) | 서버에만 존재 |
| 오류 처리 | 클라이언트에서 직접 | 서버에서 정규화 가능 |

즉 **CORS 문제의 해법이 코드에 이미 있었는데 쓰이지 않았고, 대신 n8n 워크플로에 OPTIONS 분기를 추가하는 방식으로 해결**했습니다.

**해결**: `fetchChat.ts`의 타겟을 `/api/chat-proxy`로 바꾸고, 환경 변수를 `NEXT_PUBLIC_API_URL` → `N8N_API_URL`(서버 전용)로 변경합니다. n8n의 OPTIONS 분기는 그대로 두어도 무해합니다.

---

### 3. TTS 엔드포인트 하드코딩

🔴 **배포를 차단하는 이슈입니다.**

**현상**: TTS 관련 URL 4곳이 `http://localhost:8000`으로 하드코딩되어 있습니다.

| 파일 | 호출 |
| --- | --- |
| `ConversationRoom/utils/fetchTTS.tsx` | `fetch('http://localhost:8000/tts/speak')` |
| `Components/Avatar/motion/ModelController.tsx` | `fetch('http://localhost:8000/tts/json/...')` |
| `Components/Avatar/motion/ModelController.tsx` | `new Audio('http://localhost:8000/public/tts/...')` |
| `utils/playAudioWithLipSync.ts` (미사용) | 동일 |

**영향**: 브라우저에서 실행되는 코드이므로, 배포하면 **사용자 PC의 8000 포트**를 찾습니다. 음성과 립싱크가 전부 동작하지 않습니다.

**아이러니**: `.env.local`에 `NEXT_PUBLIC_TTS_API_URL`이 **이미 정의되어 있습니다.** 변수는 만들어 두고 코드에 반영하지 않은 상태입니다.

**해결**
```ts
// src/app/config/api.ts (신규)
export const TTS_BASE = process.env.NEXT_PUBLIC_TTS_API_URL ?? 'http://localhost:8000';
```
4곳을 이 상수로 치환합니다.

---

### 4. ChooseAgent 페이지 고립

**현상**: `src/app/ChooseAgent/`는 v1의 에이전트 선택 화면입니다. 현재 **어떤 경로에서도 도달할 수 없습니다.**

```
실제 플로우: / → login → OnboardingFirstPage → OnboardingSecondPage → ConversationRoom
                                                                ↑
                                             ChooseAgent 는 여기 어디에도 없음
```

**게다가 동작하더라도 깨집니다.** 이 페이지는 `slideData`의 **한글 이름**을 쿼리 파라미터로 넘깁니다.

```ts
// ChooseAgent/page.tsx
const agentA = slideData[currentSlideA].name;   // "분석적인 상균"
router.push(`/ConversationRoom?agentA=${agentA}&agentB=${agentB}`);
```

`ConversationRoom`은 이 값을 `Role` enum으로 취급합니다.

```ts
const agentA: Role = searchParams?.get("agentA") as Role;   // "분석적인 상균"
const agentAData = RoleConfig[agentA];                       // undefined
```

`RoleConfig["분석적인 상균"]`은 존재하지 않으므로 `undefined`가 되고, 이후 `agentAData.name` 접근에서 런타임 오류가 납니다.

**영향**: 사용자에게는 노출되지 않지만, 코드를 읽는 사람이 "에이전트를 직접 고르는 기능이 있다"고 오해합니다.

**해결**: `ChooseAgent/`, `slideData.tsx`, `Avatar_Gemini.jsx`를 함께 삭제합니다. 히스토리는 git에 남습니다.

> 다만 **v1의 컨셉을 보여주는 자료로서의 가치**는 있습니다. 포트폴리오 맥락에서 방향 전환 과정을 설명할 때 참고 자료가 되므로, 삭제 대신 `legacy/` 디렉터리로 옮기고 README에 명시하는 방법도 있습니다.

---

### 5. hangul-js 의존성 위치 오류

🔴 **빌드를 차단하는 이슈입니다.**

**현상**: 립싱크 핵심 의존성인 `hangul-js`가 **앱 패키지가 아닌 상위 디렉터리**에 선언되어 있습니다.

```json
// FrontEnd/package.json  ← 여기
{ "dependencies": { "hangul-js": "^0.2.6" } }
```

```json
// FrontEnd/abora_front/package.json  ← 여기에 있어야 함
{ "dependencies": { /* hangul-js 없음 */ } }
```

이 모듈을 import하는 파일:
- `src/app/Components/Avatar/motion/ModelController.tsx` — 립싱크 타임라인 생성
- `src/app/utils/playAudioWithLipSync.ts`

**영향**: `abora_front`만 clone해 `npm install`하면 `Cannot find module 'hangul-js'`로 빌드가 실패합니다. 현재 로컬에서는 Node의 상위 디렉터리 탐색으로 우연히 해결되고 있습니다.

**해결**
```bash
cd FrontEnd/abora_front
npm install hangul-js
```
그리고 상위 `FrontEnd/package.json`을 삭제합니다 (다른 용도가 없다면).

---

## 보안

### 6. 비밀번호 평문 저장

🚨 **가장 심각한 보안 이슈입니다.**

**현상**: 회원가입 시 `users.user_password`에 비밀번호를 그대로 저장합니다.

```ts
// src/app/login/page.tsx
await supabase.from("users").insert({
    user_email: email,
    user_password: password,   // 실제로는 해시된 비밀번호를 저장해야 합니다
    user_name: name,
    ...
});
```

주석으로 문제를 인지하고 있었지만 수정되지 않았습니다.

**영향**
- DB가 유출되면 모든 사용자의 비밀번호가 그대로 노출됩니다
- 사용자가 다른 서비스와 비밀번호를 재사용한다면 피해가 확산됩니다
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 브라우저에 노출되므로, RLS가 없다면 이 컬럼을 누구나 조회할 수 있습니다 ([#12](#12-rls-정책-미확인) 참고)

**해결**: **`user_password` 컬럼을 삭제하십시오.**

이미 `supabase.auth.signUp()`이 비밀번호를 안전하게 해싱해 `auth.users`에 저장합니다. `public.users`에 비밀번호를 중복 저장할 이유가 전혀 없습니다.

```sql
ALTER TABLE users DROP COLUMN user_password;
```
```ts
await supabase.from("users").insert({
    user_email: email,
    user_name: name,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
});
```

---

### 8. 경로 순회(Path Traversal) 취약점

**현상**: `GET /tts/json/{filename}`이 파일명을 검증 없이 경로 조합에 사용합니다.

```python
# BackEnd/app/modules/tts/router.py
@router.get("/json/{filename}")
async def get_json(filename: str):
    json_path = os.path.join("public", "json", filename)   # 검증 없음
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(json_path)
```

`DELETE /tts/{filename}`도 동일합니다 — 이쪽은 **파일 삭제**까지 가능합니다.

**영향**: `../` 같은 경로 조작 문자열로 `public/json` 밖의 파일을 읽거나 삭제할 수 있습니다.

> FastAPI의 경로 파라미터는 URL 디코딩을 거치므로, 인코딩된 형태(`%2e%2e%2f`)로도 시도될 수 있습니다.

**해결**: 파일명 형식을 화이트리스트로 강제합니다. TTS 파일명은 `tts_{uuid4().hex}.{ext}` 형태로 고정되어 있으므로 정규식 검증이 쉽습니다.

```python
import re
from pathlib import Path

FILENAME_RE = re.compile(r'^tts_[0-9a-f]{32}\.(json|mp3)$')
BASE_DIR = Path("public").resolve()

def safe_path(subdir: str, filename: str) -> Path:
    if not FILENAME_RE.match(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = (BASE_DIR / subdir / filename).resolve()
    if not path.is_relative_to(BASE_DIR):        # 이중 방어
        raise HTTPException(status_code=400, detail="Invalid path")
    return path
```

---

### 12. RLS 정책 미확인

**현상**: 프론트엔드가 **anon key로 `users`·`sessions` 테이블에 직접 접근**합니다.

```ts
// 다른 사용자의 id도 조회 가능한 형태
const { data: userData } = await supabase
    .from('users').select('id').eq('user_email', user.email).single();

// 세션 생성
await supabase.from('sessions').insert({ user_id: userId, ... });
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY`는 브라우저 번들에 포함되므로 누구나 확인할 수 있습니다. 이 구조에서 데이터를 보호하는 유일한 장치가 **Row Level Security 정책**입니다.

**이 리포지토리에는 RLS 정책 정의가 없습니다.** Supabase 인스턴스에 설정되어 있는지 코드만으로는 확인할 수 없습니다.

**영향** (RLS가 없다고 가정할 때)
- 누구나 `users` 테이블 전체를 조회 → 이메일·이름·**평문 비밀번호** 노출
- 다른 사용자의 `sessions`·`conversations` 열람
- 임의 데이터 삽입·수정

**해결**: 최소한 다음 정책이 필요합니다.

```sql
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 본인 프로필만 조회
CREATE POLICY "own profile" ON users
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

-- 본인 세션만 접근
CREATE POLICY "own sessions" ON sessions
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE user_email = auth.jwt() ->> 'email')
  );
```

> n8n은 service role key로 접근하므로 RLS를 우회합니다. 대화 저장 흐름에는 영향이 없습니다.

---

## 오류 처리 및 견고성

### 7. TTS 오류가 HTTP 200으로 반환

**현상**: `POST /tts/speak`가 실패 시에도 **HTTP 200**으로 응답합니다.

```python
if not text:
    return { "error": "Text is empty." }        # HTTP 200

res = requests.post(url, ...)
if res.status_code != 200:
    return { "error": "TTS request failed." }   # HTTP 200
```

프론트엔드는 `res.ok`로만 판단합니다.

```ts
// ConversationRoom/utils/fetchTTS.tsx
if (!res.ok) throw new Error("TTS 요청 실패");   // 200이라 통과
const data = await res.json();
return { json: data.json, filename: data.filename };   // 둘 다 undefined
```

**영향**: `lipSyncA`가 `{ json: undefined, mp3: undefined }`가 되어 `ModelController`의 재생이 시작되지 않습니다. `onAudioEnd` 콜백도 호출되지 않으므로 **`currentIndex`가 증가하지 않고 재생 큐가 멈춥니다.** 화면상으로는 아바타가 입력을 받지 않는 상태로 굳어 보입니다.

**해결**
```python
if not text:
    raise HTTPException(status_code=400, detail="Text is empty.")

if res.status_code != 200:
    raise HTTPException(status_code=502, detail="TTS request failed.")
```

프론트엔드에도 방어를 추가합니다.

```ts
const data = await res.json();
if (!data.filename || !data.json) throw new Error("TTS 응답 형식 오류");
```

그리고 `useMessagePlayer`의 catch 블록에서 재생을 중단하지 말고 **다음 메시지로 진행**시켜야 큐가 멈추지 않습니다.

```ts
} catch (error) {
    console.error("TTS fetch error:", error);
    setIsSpeakingA(false); setIsSpeakingB(false);
    setCurrentIndex((prev) => prev + 1);   // 큐 진행 보장
}
```

---

### 15. 세션 없을 때 리다이렉트 비활성화

**현상**: `ConversationRoom` 진입 시 세션이 없으면 `alert`만 띄우고 화면에 머무릅니다.

```ts
// src/app/ConversationRoom/page.tsx
if (!savedSession) {
    console.error("❌ 세션이 없습니다...");
    alert("세션 정보가 없습니다. 다시 시작해주세요.");
    // router.push("/OnboardingFirstPage");   ← 주석 처리
}
```

**영향**: 사용자가 alert를 닫고 메시지를 보내면 `sendChatMessage`가 예외를 던지고, 화면에는 아무 반응도 없습니다.

**해결**: 리다이렉트를 활성화합니다. 온보딩을 거치지 않고 대화방에 들어갈 이유가 없습니다.

---

## 성능 및 자원

### 9. LoRA 파인튜닝 효과 미달

**현상**: Qwen / Llama / Mistral 7~8B 모델에 역할별 LoRA 파인튜닝을 적용했으나, **베이스 모델 대비 유의미한 개선을 얻지 못했습니다.**

| 관측 | 내용 |
| --- | --- |
| 지표 변화 | 대부분 **1% 미만** |
| 부작용 | **같은 단어를 반복하는 경향** 관측 |

**원인 분석**: 리소스 제약으로 **학습 데이터 양과 학습 횟수가 부족**했습니다. 반복 경향은 데이터·학습 부족으로 인한 **과적합 징후**로 해석합니다.

**맥락**: 이는 계획된 다운그레이드의 결과였습니다. 원래는 3개 역할 모델을 모두 풀 파인튜닝하려 했으나 기간과 컴퓨팅 리소스로 불가능하다고 판단해, **LoRA로 역할만 분리하는 수준으로 축소**했습니다. *완성하지 못하는 것보다 가진 자원 안에서 결과를 내는 것*을 택한 결정이었고, 데모와 논문화까지 도달한 것은 이 판단 덕분입니다.

**개선 방향** (우선순위 순)
1. **학습 데이터 양과 다양성 확보** — 가장 큰 병목
2. 학습 스텝 / 하이퍼파라미터 튜닝
3. 반복 억제를 위한 디코딩 파라미터 조정 (`repetition_penalty`)
4. 역할 분리를 파인튜닝이 아닌 **시스템 프롬프트 엔지니어링**으로 대체하는 방안 비교 검증

> 4번이 특히 중요합니다. 이 프로젝트의 가치는 모델 성능이 아니라 **오케스트레이션 아키텍처**에 있었고, 역할 분리가 프롬프트만으로 충분했다면 LoRA에 들인 자원을 다른 곳에 쓸 수 있었습니다.

---

### 13. 성능: 직렬 큐의 확장 한계

**현재 상태**: 초기 5분 이상이던 응답을 **약 3분**으로 단축했습니다.

| 최적화 | 내용 |
| --- | --- |
| Lazy load | 모델을 미리 상주시키지 않고 턴이 왔을 때만 fetch |
| 직렬 큐 | 요청을 큐에 담아 하나씩 순차 처리 |

**남은 한계**

```
동시 사용자 1명   →  약 3분
동시 사용자 3명   →  약 9분 (직렬 처리로 대기 누적)
```

- 직렬 큐는 **처리량(throughput)을 희생해 안정성을 얻는** 방식입니다. 요청이 몰리면 대기 지연이 그대로 누적됩니다
- Lazy load는 **콜드 스타트 비용을 매 턴 지불**합니다
- 두 최적화 모두 **단일 머신 제약을 우회한 것이지 해결한 것이 아닙니다**

**근본 해결 방향**
- 추론 서버를 애플리케이션과 **분리**하고 수평 확장
- GPU 자원 풀링 / 모델 서빙 프레임워크(vLLM, TGI 등) 도입
- 모델 크기 축소 또는 양자화로 상주 가능한 수준까지 낮추기
- 스트리밍 응답으로 **체감 지연** 개선 (첫 토큰까지의 시간을 줄임)

> 마지막 항목은 아키텍처 변경 없이 가장 큰 UX 개선을 줍니다. 현재는 전체 응답이 완성될 때까지 3분간 아무것도 보이지 않지만, 스트리밍이라면 몇 초 안에 첫 글자가 나옵니다.

---

### 14. Whisper 모델 중복 로드

**현상**: Whisper 모델이 두 번 로드됩니다.

```python
# app/modules/tts/whisper.py
model = WhisperModel("base", device="cpu", compute_type="int8")   # ①

# app/modules/tts/router.py
whisper_model = WhisperModel("base", device="cpu", compute_type="int8")   # ② 사용되지 않음
```

`router.py`의 인스턴스는 **어디에서도 참조되지 않습니다.** `analyze_whisper()`는 `whisper.py`의 인스턴스를 씁니다.

**영향**: 16GB 단일 머신에서 Ollama가 대부분의 메모리를 쓰는 상황이라, 무시할 수 없는 낭비입니다.

**해결**: `router.py`의 `whisper_model` 선언과 `from faster_whisper import WhisperModel` import를 삭제합니다.

---

### 10. TTS 산출물이 정리되지 않음

**현상**: 생성된 mp3/JSON이 삭제되지 않고 계속 쌓입니다.

```
POST /tts/speak → public/tts/*.mp3 + public/json/*.json 생성
                → 재생 완료
                → ❌ 삭제되지 않음
```

`DELETE /tts/{filename}` 엔드포인트는 구현되어 있으나 **프론트엔드에서 호출하지 않습니다.**

**현재 리포지토리에 44쌍의 파일이 커밋되어 있습니다.** 런타임 산출물이 버전 관리에 포함된 상태입니다.

**해결**

1. `BackEnd/.gitignore`에 산출물 제외 추가
   ```
   public/tts/*.mp3
   public/json/*.json
   ```
2. 재생 완료 후 프론트엔드가 `DELETE /tts/{filename}` 호출, 또는 백엔드에 TTL 기반 정리 작업 추가
3. **캐싱 도입** — 현재는 같은 문장도 매번 새로 생성합니다. `hash(text + voice)`를 파일명으로 쓰면 재사용이 가능하고, Google TTS 호출 비용과 Whisper 분석 시간을 함께 줄일 수 있습니다

> 3번이 가장 효과가 큽니다. 시나리오 도입부처럼 반복되는 문장이 많고, Whisper 분석은 CPU를 점유하는 무거운 작업입니다.

---

## 유지보수

### 11. role 한글 매핑이 두 곳에 중복

**현상**: `Role` → 한글 매핑이 **두 곳에 각각 정의**되어 있습니다.

```ts
// ① src/app/config/mapKorean.ts
const roleToKorean: Record<Role, string> = {
  [Role.User]: '사용자', [Role.Developer]: '개발자',
  [Role.Designer]: '디자이너', [Role.Planner]: '기획자',
};
```

```ts
// ② src/app/OnboardingSecondPage/page.tsx — handleButtonClick 내부
const roleToKorean = (role: Role): string => {
  const roleMap: Record<Role, string> = {
    [Role.User]: '사용자', [Role.Developer]: '개발자',
    [Role.Planner]: '기획자', [Role.Designer]: '디자이너',
  };
  return roleMap[role];
};
```

②는 ①을 import하고 있으면서도(`import roleToKorean from '@/app/config/mapKorean'`) **같은 이름의 지역 함수로 가려버립니다.**

**영향**: 한쪽만 수정하면 DB에 저장되는 값과 조회에 쓰이는 값이 어긋납니다. 그 결과 `getRoleByKorean`이 `undefined`를 반환하고, 에이전트 메시지가 **사용자 말풍선으로 렌더링**됩니다 — 에러 없이 조용히 잘못 표시되는 유형의 버그입니다.

**해결**: ②의 지역 함수를 삭제하고 import한 매핑을 사용합니다.

```ts
import roleToKorean from '@/app/config/mapKorean';
// ...
user_role: roleToKorean[roleParam],   // 객체 조회
```

**더 나은 해결**: role 표기를 **전 계층 영문으로 통일**하고, 한글은 UI 렌더링 시점에만 변환합니다. DB ENUM을 영문으로 바꾸면 변환 지점이 한 곳으로 줄고 타입 안전성도 확보됩니다 ([06. 데이터 모델](06-data-model.md#4-role-표기-컨벤션) 참고).

---

### 16. 워크플로가 버전 관리되지 않음

**현상**: n8n 워크플로가 n8n 인스턴스 내부에만 존재합니다. **export JSON이 리포지토리에 없습니다.**

**영향**
- 워크플로 변경 이력을 추적할 수 없음 — 누가 언제 어떤 프롬프트를 바꿨는지 알 수 없음
- 인스턴스가 손실되면 워크플로도 함께 손실
- 코드 리뷰 불가
- 새 환경에서 재구축하려면 스크린샷을 보고 수작업으로 다시 만들어야 함 ([07. 실행 및 배포](07-setup.md#5-3-n8n-워크플로) 참고)

**해결**: n8n에서 워크플로를 export해 리포지토리에 커밋합니다.

```
n8n/
└── workflows/
    └── expert-models.json
```

> ⚠️ export JSON에 자격 증명 ID가 포함될 수 있습니다. 커밋 전에 확인이 필요합니다.

이 프로젝트에서 **가장 핵심적인 로직이 버전 관리 밖에 있는 상태**입니다. 우선순위를 높게 볼 만합니다.

---

### 17. 기타 잔존 코드

| 파일 | 상태 | 조치 |
| --- | --- | --- |
| `src/pages/api/questions.ts` | `localhost:8000/questions/chat` 호출 — **백엔드에 없는 엔드포인트** | 삭제 |
| `src/app/ConversationRoom/hooks/useChatSession.tsx` | 정의만 되어 있고 호출되지 않음 | 삭제 또는 `OnboardingSecondPage`에서 실제 사용 |
| `src/app/utils/playAudioWithLipSync.ts` | `ModelController` 내부 구현과 중복 | 삭제, 또는 공통 함수로 추출해 양쪽에서 사용 |
| `src/app/utils/LipSyncTiming.ts` | 전체 주석 처리 | 삭제 |
| `src/app/Components/Avatar/motion/LipSyncWrapper.tsx` | 전체 주석 처리 | 삭제 |
| `src/app/Components/Avatar/motion/LipSyncAvatar.tsx` | 전체 주석 처리 | 삭제 |
| `src/data/role.json` | 전체 주석 처리 (JSON에 주석은 문법 위반) | 삭제 |
| `BackEnd/app/modules/tts/utils.py` | 빈 파일 | 삭제 |
| `src/app/Components/ReactBits/Aurora.tsx` | `layout.tsx`에서 주석 처리 | 사용 여부 결정 |
| `src/app/Components/GSAP/CustomCursor.tsx` | `layout.tsx`에서 주석 처리 | 사용 여부 결정 |
| `src/app/slideData.tsx` · `Avatar_Gemini.jsx` | v1 잔존 ([#4](#4-chooseagent-페이지-고립)) | `ChooseAgent`와 함께 처리 |
| `.idea/` | JetBrains 설정이 커밋됨 | `.gitignore` 추가 검토 |
| `.DS_Store` | 루트 `.gitignore`에 있으나 하위에 잔존 | `git rm --cached` |

**기타 코드 품질**

| | |
| --- | --- |
| `console.log` 다수 | `fetchChat.ts`, `handleSendMessage.tsx`, `mapKorean.ts` 등에 이모지 로그 다수. 프로덕션 빌드에서 제거 필요 |
| 미완성 UI 문구 | `ConversationRoom` 입력창 placeholder가 `"ex) "` — `//예시 주석 달아주세요` 주석과 함께 남아 있음 |
| `room_name` 미구현 | `ChatSession` 인터페이스에 있으나 저장되지 않음. `OnboardingFirstPage`에 입력 UI가 주석 처리됨 |
| 타입 선언 불일치 | `ChatSession.sender_role: Role`(영문)로 선언되어 있으나 실제 저장 값은 한글 문자열 |
| 커밋 메시지 | `tmp save`, `fix: fucking tts` 등. 공개 저장소라면 정리 검토 |

---

## 개선 로드맵

작업량 대비 효과를 기준으로 정렬했습니다.

### 1순위 — 보안 (즉시)

| | 작업 | 예상 |
| --- | --- | --- |
| ☐ | `users.user_password` 컬럼 삭제 ([#6](#6-비밀번호-평문-저장)) | 30분 |
| ☐ | RLS 정책 설정 및 검증 ([#12](#12-rls-정책-미확인)) | 2시간 |
| ☐ | TTS 파일명 검증 추가 ([#8](#8-경로-순회path-traversal-취약점)) | 1시간 |
| ☐ | 백엔드 CORS origin 명시 | 30분 |

### 2순위 — 동작 정상화

| | 작업 | 예상 |
| --- | --- | --- |
| ☐ | TTS URL을 환경 변수로 치환 ([#3](#3-tts-엔드포인트-하드코딩)) | 1시간 |
| ☐ | `hangul-js` 의존성 위치 수정 ([#5](#5-hangul-js-의존성-위치-오류)) | 10분 |
| ☐ | TTS 오류 상태 코드 정정 + 큐 진행 보장 ([#7](#7-tts-오류가-http-200으로-반환)) | 2시간 |
| ☐ | 세션 없을 때 리다이렉트 활성화 ([#15](#15-세션-없을-때-리다이렉트-비활성화)) | 10분 |
| ☐ | role 매핑 중복 제거 ([#11](#11-role-한글-매핑이-두-곳에-중복)) | 30분 |

### 3순위 — 코드 정리

| | 작업 | 예상 |
| --- | --- | --- |
| ☐ | 잔존 코드 삭제 ([#4](#4-chooseagent-페이지-고립), [#17](#17-기타-잔존-코드)) | 2시간 |
| ☐ | Tailwind 의존성 제거 ([#1](#1-tailwind-css-미사용)) | 10분 |
| ☐ | Whisper 중복 로드 제거 ([#14](#14-whisper-모델-중복-로드)) | 10분 |
| ☐ | TTS 산출물 gitignore + 정리 ([#10](#10-tts-산출물이-정리되지-않음)) | 1시간 |
| ☐ | `console.log` 정리 | 1시간 |

### 4순위 — 운영 기반

| | 작업 | 예상 |
| --- | --- | --- |
| ☐ | **n8n 워크플로 export 커밋** ([#16](#16-워크플로가-버전-관리되지-않음)) | 1시간 |
| ☐ | docker-compose / Nginx 설정을 리포지토리에 포함 | 4시간 |
| ☐ | DB 마이그레이션 파일 작성 | 3시간 |
| ☐ | GitHub Actions 기반 빌드 검증 | 4시간 |

### 5순위 — 기능·성능 확장

| | 작업 | 효과 |
| --- | --- | --- |
| ☐ | **응답 스트리밍** | 체감 지연 3분 → 수초. 가장 큰 UX 개선 |
| ☐ | TTS 캐싱 (`hash(text+voice)`) | 반복 문장의 생성 비용 제거 |
| ☐ | chat-proxy 경유로 전환 ([#2](#2-chat-proxy-미사용)) | CORS 제거 + n8n 주소 은닉 |
| ☐ | 대화 이력 조회 화면 | 지난 세션 복기 — 훈련 목적에 직접 부합 |
| ☐ | 대화 분석·피드백 | "당신은 개발자 관점을 3회 언급했습니다" 등 |
| ☐ | 음성 입력 (STT) | Whisper가 이미 있으므로 재사용 가능 |
| ☐ | 추론 서버 분리 + 수평 확장 ([#13](#13-성능-직렬-큐의-확장-한계)) | 근본적 성능 해결 |
| ☐ | 테스트 코드 (Jest / Playwright) | 현재 테스트 0건 |

---

## 마무리 — 이 이슈 목록을 어떻게 볼 것인가

여기 정리한 17건 중 상당수는 **의도적으로 미룬 것**이 아니라 **기간 안에 도달하지 못한 것**입니다. 그 사실을 그대로 기록하는 편이 낫다고 판단했습니다.

동시에 몇 가지는 **규모와 무관하게 갖췄어야 할 기본**입니다. 비밀번호 평문 저장([#6](#6-비밀번호-평문-저장)), 경로 검증 부재([#8](#8-경로-순회path-traversal-취약점)), 오류 상태 코드([#7](#7-tts-오류가-http-200으로-반환))가 그렇습니다. 이런 항목이 남은 이유는 우선순위 판단의 문제라기보다, **당시 인프라·보안 영역의 사전 지식이 부족했기 때문**입니다. 실제로 배포 단계에서 CORS preflight 하나를 이해하는 데 상당한 시간을 썼습니다.

이 프로젝트가 남긴 가장 큰 자산은 완성된 코드가 아니라 **한계를 측정해서 확인했다는 것**입니다. 응답 3분의 원인이 무엇이고 왜 직렬 큐로는 부족한지, LoRA가 왜 효과가 없었고 무엇을 먼저 고쳐야 하는지, n8n의 표현력이 어디서 막히는지 — 전부 직접 부딪혀서 알게 된 것들입니다.

---

| ← | |
| --- | --- |
| [07. 실행 및 배포](07-setup.md) | [문서 인덱스](../README.md) |
