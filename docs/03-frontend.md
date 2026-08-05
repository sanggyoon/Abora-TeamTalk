# 03. 프론트엔드

> [← 02. 시스템 아키텍처](02-architecture.md) · [문서 인덱스](../README.md)

**위치**: `FrontEnd/abora_front/`

---

## 1. 기술 구성

| 분류 | 라이브러리 | 버전 |
| --- | --- | --- |
| 프레임워크 | Next.js (App Router) | 15.3.0 |
| UI | React / React DOM | 19.0.0 |
| 언어 | TypeScript | 5 |
| 3D | three | 0.175.0 |
| 3D (React 바인딩) | @react-three/fiber | 9.1.2 |
| 3D 헬퍼 | @react-three/drei | 10.0.7 |
| 애니메이션 | gsap / @gsap/react | 3.13.0 / 2.1.2 |
| 애니메이션 | motion | 12.23.16 |
| WebGL (경량) | ogl | 1.0.11 (Aurora 배경 효과) |
| 아이콘 | react-icons | 5.5.0 |
| DB/Auth 클라이언트 | @supabase/supabase-js | 2.75.0 |
| 한글 처리 | **hangul-js** | 0.2.6 ⚠️ |
| 스타일 | **CSS Modules + CSS 변수** | — |

> ⚠️ **`hangul-js`는 `FrontEnd/abora_front/package.json`이 아니라 상위 `FrontEnd/package.json`에 선언되어 있습니다.** 립싱크의 핵심 의존성인데 앱 패키지에서 빠져 있어, `abora_front`만 clone해 `npm install`하면 빌드가 깨집니다. 실행 시 주의사항은 [07. 실행 및 배포](07-setup.md)를 참고하십시오.

> ⚠️ Tailwind CSS가 devDependency에 있으나 **설정 파일도 지시자도 없어 실제로 사용되지 않습니다.** 스타일링은 전부 CSS Modules입니다.

**하이브리드 라우팅**: App Router(`src/app/`)와 Pages Router(`src/pages/api/`)를 함께 씁니다. 화면은 App Router, API Route는 Pages Router로 작성되어 있습니다.

---

## 2. 디렉터리 구조

```
FrontEnd/abora_front/
├── src/
│   ├── app/                              # App Router — 화면
│   │   ├── page.tsx                      # / 랜딩
│   │   ├── layout.tsx                    # 루트 레이아웃 (Geist 폰트)
│   │   ├── globals.css                   # CSS 변수 정의
│   │   ├── slideData.tsx                 # ⚠️ v1 잔존: 성향 기반 4 페르소나
│   │   │
│   │   ├── login/                        # /login  Supabase Auth
│   │   ├── OnboardingFirstPage/          # /OnboardingFirstPage  직군 선택
│   │   ├── OnboardingSecondPage/         # /OnboardingSecondPage 시나리오 선택 + 세션 생성
│   │   ├── ChooseAgent/                  # ⚠️ v1 잔존: 도달 불가
│   │   ├── ConversationRoom/             # /ConversationRoom  대화방
│   │   │   ├── page.tsx                  #   화면 + 상태 오케스트레이션
│   │   │   ├── hooks/
│   │   │   │   ├── useMessagePlayer.tsx  #   메시지 순차 재생 훅
│   │   │   │   └── useChatSession.tsx    #   ⚠️ 정의되어 있으나 미사용
│   │   │   └── utils/
│   │   │       ├── handleSendMessage.tsx #   전송 → 응답 변환 → 큐 적재
│   │   │       ├── fetchTTS.tsx          #   TTS 요청
│   │   │       ├── voiceSelector.tsx     #   화자별 음성 선택
│   │   │       ├── lipSyncHandler.tsx    #   립싱크 상태 배분
│   │   │       └── getRoleByKorean.ts    #   한글 role → enum 역변환
│   │   │
│   │   ├── Components/
│   │   │   ├── Avatar/
│   │   │   │   ├── AvatarScene.tsx       #   R3F Canvas + 조명 + 카메라
│   │   │   │   ├── Avatar_GPT.jsx        #   GLB 로더 (sanggyun)
│   │   │   │   ├── Avatar_Claude.jsx     #   GLB 로더 (dongnyeon)
│   │   │   │   ├── Avatar_Llama.jsx      #   GLB 로더 (jungmin)
│   │   │   │   ├── Avatar_Gemini.jsx     #   GLB 로더 (chaeyoung) — v1 전용
│   │   │   │   └── motion/
│   │   │   │       ├── ModelController.tsx   # ★ 립싱크 + 애니메이션 핵심
│   │   │   │       ├── LipSyncWrapper.tsx    # (전체 주석 처리)
│   │   │   │       └── LipSyncAvatar.tsx     # (전체 주석 처리)
│   │   │   ├── ChatBubble.tsx            #   User / AgentA / AgentB 말풍선
│   │   │   ├── LoadingComponent.tsx      #   에이전트별 로딩 인디케이터
│   │   │   ├── SenarioBlock/             #   시나리오 카드
│   │   │   ├── feature/AvatarBlock/      #   동료 소개 카드 (3D 포함)
│   │   │   ├── ui/                       #   WhiteBlock, TitleTextBlock, RoleBadge 등
│   │   │   ├── GSAP/                     #   TextScramble, TypingText, Loader 등
│   │   │   └── ReactBits/                #   Aurora, CircularText, TextSplit
│   │   │
│   │   ├── config/
│   │   │   ├── RoleConfig.ts             # ★ 직군별 통합 설정 (단일 진실 공급원)
│   │   │   └── mapKorean.ts              #   Role enum → 한글
│   │   ├── types/
│   │   │   ├── enum.ts                   #   Role, ChatRole
│   │   │   └── interface.ts              #   Message, Chat, ChatSession 등
│   │   └── utils/
│   │       ├── mapKoreanToShape.tsx      # ★ 한글 자모 → viseme
│   │       ├── playAudioWithLipSync.ts   #   (ModelController와 중복 구현)
│   │       ├── LipSyncTiming.ts          #   (전체 주석 처리)
│   │       └── api/fetchChat.ts          # ★ n8n 웹훅 호출
│   │
│   ├── pages/api/                        # Pages Router — API Route
│   │   ├── chat-proxy.ts                 # ⚠️ 정의되어 있으나 미사용
│   │   └── questions.ts                  # ⚠️ 존재하지 않는 백엔드를 호출
│   │
│   ├── lib/supabase.ts                   # Supabase 클라이언트
│   └── data/
│       ├── senario.json                  # 시나리오 3종
│       └── role.json                     # (전체 주석 처리)
│
└── public/
    ├── models/*.glb                      # 3D 아바타 4종
    ├── iconImage/                        # 직군·시나리오 아이콘
    ├── icon/PersonaProfileIcon/          # 프로필 아이콘
    └── fonts/Pretendard-*.otf
```

---

## 3. 핵심 타입

### 3-1. `src/app/types/enum.ts`

```ts
export enum Role {
    User = "user",
    Developer = "developer",
    Planner = "planner",
    Designer = "designer"
}

export enum ChatRole {
    User = "user",
    AgentA = "agentA",
    AgentB = "agentB",
}
```

**두 enum의 역할이 다릅니다.**

- `Role` — **직군의 정체성**. 어떤 페르소나인가 (개발자/기획자/디자이너)
- `ChatRole` — **대화방 안의 위치**. 화면 좌측(A)인가 우측(B)인가

같은 `Role.Planner`라도 대화방에서 좌측에 배치되면 `ChatRole.AgentA`, 우측이면 `ChatRole.AgentB`가 됩니다. 이 분리 덕분에 말풍선 정렬·아바타 배치·립싱크 대상 선택이 직군과 무관하게 위치 기준으로 동작합니다.

### 3-2. `src/app/types/interface.ts`

```ts
// 화면에 표시되는 메시지
export interface Message {
    speaker: string;        // 발화자 표시 이름
    type: ChatRole;         // 좌/우/사용자 구분
    message: string;
    timestamp: string;
}

// n8n으로 보낼 요청 body
export interface Chat {
    session_id: number;     // Supabase sessions.id
    sender_role: Role;      // 사용자가 고른 직군
    is_user: boolean;
    content: string;        // 사용자 입력
    worker1_role: Role;     // 동료 1 직군
    worker2_role: Role;     // 동료 2 직군
}

// n8n 응답
export interface ResponseChatResponse {
    success: boolean;
    session_id: number;
    messages: Array<{
        ai_role: string;    // ⚠️ 한글 ("개발자" 등)
        content: string;
        created_at: string;
    }>;
}

// 립싱크 재생에 필요한 파일 쌍
export interface LipSyncData {
    json: string;           // 타이밍 JSON 파일명
    mp3: string;            // 음성 파일명
}
```

### 3-3. `src/app/config/RoleConfig.ts` — 단일 진실 공급원

직군별 설정이 한곳에 모여 있습니다. 화면 어디서든 `RoleConfig[role]`로 필요한 값을 꺼내 씁니다.

```ts
[Role.Developer]: {
    color: "#747474",
    role: "개발자",
    name: "Devu",
    personality: { title: "성격", desc: "꼼꼼하고 현실적, 가끔 직설적" },
    interest:    { title: "관심사", desc: "코드 품질, 성능 최적화, 기술 부채" },
    IconImageSrc:    "/iconImage/roleIcon1.png",
    profileImageSrc: "/icon/PersonaProfileIcon/Developer.png",
    Component: Avatar_GPT,           // 3D 모델 컴포넌트
    glb:  '/models/sanggyun.glb',
    voice: "ko-KR-Chirp3-HD-Achird", // TTS 음성
}
```

**이 설계의 효과**: 직군을 하나 추가하려면 `Role` enum에 값을 넣고 `RoleConfig`에 항목 하나를 추가하면 됩니다. 온보딩 선택지, 동료 배정, 아바타 렌더링, TTS 음성 선택이 전부 `Object.values(Role)` 순회와 `RoleConfig[role]` 조회로 되어 있어 화면 코드를 고칠 필요가 없습니다.

---

## 4. 화면별 구현

### 4-1. `/` — 랜딩 (`src/app/page.tsx`)

`CircularText`(원형 회전 텍스트)와 `SplitText`(글자 단위 등장 애니메이션)로 구성된 인트로 화면입니다. "ENTER" 버튼 클릭 시 로더를 띄우고 1초 뒤 `/OnboardingFirstPage`로 이동합니다.

이 화면의 카피가 **v1의 문제 정의를 그대로 담고 있습니다** ("대화형 아이디어 실험실"). 자세한 맥락은 [01. 개요](01-overview.md#2-기획-배경--두-번의-문제-정의)를 참고하십시오.

### 4-2. `/login` — 인증 (`src/app/login/page.tsx`)

로그인/회원가입을 **하나의 컴포넌트에서 `isSignUp` 상태로 토글**합니다.

| 동작 | 처리 |
| --- | --- |
| 로그인 | `supabase.auth.signInWithPassword` → 성공 시 `users.last_login` 갱신 → 온보딩 이동 |
| 회원가입 | `supabase.auth.signUp` → `users` 테이블에 프로필 INSERT → 온보딩 이동 |

> 🚨 **보안 이슈**: 회원가입 시 `users.user_password`에 **비밀번호를 평문으로 저장**합니다. 코드에도 `// 실제로는 해시된 비밀번호를 저장해야 합니다` 주석이 남아 있습니다. Supabase Auth가 이미 인증을 담당하므로 이 컬럼 자체가 불필요합니다. 상세는 [08. 알려진 이슈](08-known-issues.md#6-비밀번호-평문-저장)를 참고하십시오.

### 4-3. `/OnboardingFirstPage` — 직군 선택

**진입 시 인증 가드**가 동작합니다.

```ts
const { data: { session } } = await supabase.auth.getSession();
if (!session) router.push("/login");
```

`Object.values(Role)`에서 `Role.User`를 제외한 3직군을 `WhiteBlock` 카드로 렌더링합니다. 선택 시 `localStorage.selectedRole`에 저장하고, 다음 페이지로 `?role=developer` 형태의 쿼리스트링과 함께 이동합니다.

**선택 상태 표현**은 인라인 스타일로 테두리 색을 바꾸는 방식입니다.

```tsx
style={{ border: `2px solid ${selectedRoleIndex === idx ? "var(--select-color)" : "white"}` }}
```

### 4-4. `/OnboardingSecondPage` — 시나리오 선택 + 세션 생성

**이 페이지가 프론트엔드에서 가장 많은 일을 합니다.** 화면은 두 섹션입니다.

1. **시나리오 3종 카드** (`SenarioBlock`) — `src/data/senario.json`에서 로드. 선택 시 `localStorage.selectedScenario`에 저장
2. **동료 2명 소개** (`AvatarBlock`) — 사용자 직군을 제외한 나머지 2직군을 **3D 아바타와 함께** 미리 보여줌 (성격·관심사 포함)

"인사하러 가기" 버튼을 누르면 다음 순서로 실행됩니다.

```
① 시나리오 선택 여부 확인 (미선택 시 alert)
② supabase.auth.getUser() — 현재 로그인 사용자
③ users 테이블에서 user_email로 내부 id 조회
④ 동료 2명 결정: Object.values(Role) - User - 내 직군
⑤ scenarioType 생성: `시나리오${index + 1}`
⑥ sessions 테이블 INSERT
     { user_id, user_role, worker1_role, worker2_role,
       scenario_type, session_description }
     ※ role은 모두 한글로 변환해 저장
⑦ localStorage 저장
     session_id  : "12"
     chatSession : { session_id, sender_role, is_user,
                     worker1_role, worker2_role }   ※ role은 한글
⑧ /ConversationRoom?agentA=planner&agentB=designer 로 이동
     ※ 쿼리스트링의 role은 영문 enum 값
```

> ⚠️ **여기서 role 표기가 두 갈래로 갈립니다.** DB와 `localStorage.chatSession`에는 **한글**("기획자")로, URL 쿼리스트링에는 **영문 enum**("planner")으로 저장됩니다. 이 이원화가 `getRoleByKorean` 역변환 함수가 존재하는 이유입니다. 상세는 [06. 데이터 모델](06-data-model.md#4-role-표기-컨벤션)을 참고하십시오.

> ⚠️ 이 페이지는 `useChatSession` 훅을 쓰지 않고 세션 생성 로직을 인라인으로 구현합니다. 훅은 정의만 되어 있고 어디서도 호출되지 않습니다.

### 4-5. `/ConversationRoom` — 대화방

레이아웃은 **3열 구조**입니다.

```
┌────────────┬───────────────────────┬────────────┐
│  AgentA    │     채팅 로그          │  AgentB    │
│  (3D)      │     (스크롤)          │  (3D)      │
│            ├───────────────────────┤            │
│            │  입력창 + Send        │            │
└────────────┴───────────────────────┴────────────┘
```

`useSearchParams`로 `agentA` / `agentB`를 읽어 `RoleConfig`에서 각 직군 데이터를 가져옵니다. `useSearchParams`가 Suspense를 요구하므로 컴포넌트 전체가 `<Suspense>`로 감싸여 있습니다.

**상태 목록** (`page.tsx`)

| 상태 | 용도 |
| --- | --- |
| `messages` | 화면에 표시되는 전체 대화 로그 |
| `messagesToPlay` | 이번 턴에 재생할 에이전트 응답 큐 |
| `currentIndex` | 큐에서 지금 재생 중인 인덱스 (-1이면 대기) |
| `inputValue` | 입력창 |
| `isLoading` | n8n 응답 대기 중 |
| `isFocused` | 입력창 포커스 (아바타 모션에 반영) |
| `currentSpeaker` | 현재 발화 중인 `ChatRole` |
| `isSpeakingA` / `isSpeakingB` | 각 아바타의 음성 재생 여부 |
| `lipSyncA` / `lipSyncB` | 각 아바타에 전달할 `{json, mp3}` 파일 쌍 |

**아바타 모션이 상태에 따라 바뀝니다.**

```ts
const currentActionA =
    isLoading                    ? 'left_pending'   // 응답 대기 중
  : isSpeakingA                  ? 'breath'         // 본인 발화 중
  : currentSpeaker === 'agentB'  ? 'left_pending'   // 상대 발화 중 — 듣는 자세
  : isFocused                    ? 'left_reading'   // 사용자가 타이핑 중 — 읽는 자세
  :                                'breath';        // 기본 대기
```

좌/우 아바타가 각각 `left_*` / `right_*` 애니메이션 클립을 쓰므로, GLB 파일에 방향별 클립이 준비되어 있어야 합니다.

---

## 5. 3D 아바타 립싱크 파이프라인

프론트엔드에서 가장 복잡한 부분입니다. **텍스트 → 음성 → 입 모양 애니메이션**까지 전 과정을 다룹니다.

### 5-1. 전체 흐름

```
                        [ handleSendMessage ]
사용자 입력 ──→ n8n 호출 ──→ 응답 messages[] 를 ChatRole로 변환
                                    ↓
                      setMessagesToPlay(msgs), setCurrentIndex(0)
                                    ↓
                        [ useMessagePlayer ]  ← currentIndex 변화 감지
                                    ↓
              ① 메시지를 화면 로그(messages)에 추가
              ② 화자에 맞는 TTS 음성 선택 (voiceSelector)
              ③ isSpeakingA / isSpeakingB = true
              ④ POST /tts/speak { text, voice }  →  { filename, json }
              ⑤ setLipSyncA / setLipSyncB = { json, mp3 }
                                    ↓
                        [ AvatarScene → ModelController ]
              ⑥ GET /tts/json/{json}       → [{start, end, text}, ...]
              ⑦ 한글 자모 분해 → viseme 매핑 → 타임라인 생성
              ⑧ new Audio(mp3).play()
              ⑨ setTimeout으로 구간마다 morph target 전환
              ⑩ audio.onended → onAudioEnd()
                                    ↓
                        [ page.tsx 콜백 ]
              ⑪ isSpeaking = false
              ⑫ 큐에 다음 메시지가 있으면 currentIndex + 1 → ③으로
                 없으면 currentSpeaker = null (턴 종료)
```

### 5-2. 응답 → ChatRole 변환 (`handleSendMessage.tsx`)

n8n이 돌려주는 `ai_role`은 **한글**입니다("개발자"). 이걸 화면 위치(`ChatRole`)로 바꿔야 합니다.

```ts
const aiRoleEnglish = getRoleByKorean(msg.ai_role);   // "개발자" → Role.Developer
const type = aiRoleEnglish === agentA ? ChatRole.AgentA    // 좌측
           : aiRoleEnglish === agentB ? ChatRole.AgentB    // 우측
           : ChatRole.User;                                // 매칭 실패 시 fallback
```

`getRoleByKorean`은 `mapKorean.ts`의 매핑을 **역으로 뒤집어** 조회합니다.

```ts
const entry = Object.entries(roleToKorean).find(([, value]) => value === korean);
return entry ? (entry[0] as Role) : undefined;
```

> ⚠️ 매칭에 실패하면 에이전트 메시지가 `ChatRole.User`로 떨어져 **사용자 말풍선으로 표시**됩니다. 한글 표기가 하나라도 어긋나면 조용히 잘못 렌더링되는 구조입니다.

### 5-3. 한글 자모 → viseme 매핑 (`mapKoreanToShape.tsx`)

한글 자모를 5개 입 모양(viseme)으로 축약합니다.

```ts
export default function mapKoreanToShape(jamo: string) {
    if ("ㅏㅑㅓㅕ".includes(jamo)) return "AA";   // 입 크게 벌림
    if ("ㅣㅐㅔ".includes(jamo))   return "II";   // 옆으로 벌림
    if ("ㅗㅛ".includes(jamo))     return "OO";   // 동그랗게
    if ("ㅜㅠㅡ".includes(jamo))   return "UU";   // 오므림
    if ("ㅁㅂㅍ".includes(jamo))   return "EE";   // 입술 다물기 (양순음)
    return "Idle";                                // 그 외 — 기본
}
```

**설계 판단**: 모음 4종 + 양순음 1종만 처리하고 나머지 자음은 `Idle`로 둡니다. 정밀한 음소 립싱크가 아니라 **"말하는 것처럼 보이는" 최소 집합**을 택한 것입니다. 자음까지 매핑하면 입 모양이 과도하게 빨리 바뀌어 오히려 부자연스러워지고, 무엇보다 타이밍 데이터의 해상도(Whisper 구간 단위)가 자음 수준의 정밀도를 뒷받침하지 못합니다.

> 파일 하단 주석에 자음까지 포함한 9종 매핑(`M/A/E/O/U/L/S/H/N`)이 남아 있습니다. 시도했다가 축소한 흔적입니다.

### 5-4. 타임라인 생성 (`ModelController.tsx`)

Whisper가 준 것은 **문장 단위 구간**입니다.

```json
[
  { "start": 0.0,  "end": 5.36, "text": " 환영합니다. 프로젝트 기획자로서 오늘과 관련된 사항에 대해서 알려드릴게요." },
  { "start": 5.36, "end": 9.2,  "text": " 제가 현재 어떤 프로젝트를 진행하고 있는지 궁금하세요." }
]
```

이 구간을 자모 단위로 **균등 분할**합니다.

```ts
for (const { text, start, end } of segments) {
    const jamos = Hangul.disassemble(text).filter((j) => j.trim());
    const duration = end - start;
    const per = duration / jamos.length;        // 자모 하나당 시간 = 구간 / 자모 수

    jamos.forEach((j, i) => {
        timeline.push({
            phoneme: mapKoreanToShape(j),
            start: +(start + i * per).toFixed(2),
            end:   +(start + (i + 1) * per).toFixed(2),
        });
    });
}
```

예: 5.36초 구간에 자모가 100개면 자모당 53.6ms. 실제 발화 속도는 균일하지 않으므로 **근사치**입니다.

> 빈 구간(`jamos.length === 0`)이면 `II` 입 모양을 통째로 넣어 0으로 나누는 상황을 피합니다.

### 5-5. 재생과 morph target 적용

```ts
const audio = new Audio(`http://localhost:8000/public/tts/${mp3Filename}`);

audio.onplay = () => {
    timeline.forEach(({ phoneme, start, end }) => {
        setTimeout(() => setCurrentPhoneme(phoneme), start * 1000);
        setTimeout(() => setCurrentPhoneme('Idle'),  end * 1000);
    });
};

audio.onended = () => { onAudioEnd?.(); resolve(); };
audio.play();
```

`setTimeout`을 타임라인 길이만큼 미리 전부 예약하는 방식입니다. 구현은 단순하지만, 재생 중 일시정지나 취소를 지원하지 않고 타이머가 정리되지 않습니다.

**phoneme → morph target 인덱스 변환**

```ts
const phonemeToIndex = { Idle: 1, AA: 2, II: 3, UU: 4, EE: 5, OO: 6 };
```

GLB의 morph target(블렌드셰이프) 순서에 하드코딩으로 매핑되어 있습니다. 모델을 다시 export하면서 순서가 바뀌면 입 모양이 어긋납니다.

**선형 보간으로 부드럽게 적용**

```ts
useFrame(() => {
    const influences = meshRef.current.morphTargetInfluences;
    for (let i = 0; i < targetInfluences.length; i++) {
        influences[i] += (targetInfluences[i] - influences[i]) * 0.2;
    }
});
```

매 프레임마다 목표값 쪽으로 20%씩 접근시킵니다. 입 모양이 순간적으로 튀지 않고 부드럽게 전환되는 이유입니다.

**대상 메시 탐색**

```ts
modelRef.current.traverse((child) => {
    if (child.isMesh && child.morphTargetInfluences &&
        child.name.toLowerCase().includes('mouse')) {
        meshRef.current = child;
    }
});
```

메시 이름에 `mouse`가 포함된 것을 입 메시로 간주합니다. (`mouth`의 오타로 보이지만, GLB 쪽 이름도 동일하게 되어 있어 동작합니다. 모델과 코드가 함께 지켜야 하는 암묵적 규약입니다.)

### 5-6. 애니메이션 클립 전환

```ts
Object.values(actions).forEach((action) => action?.fadeOut(0.2));

const actionToPlay = actions[mappedAction];
if (actionToPlay) {
    // 대기 모션은 절반 속도로 — 차분한 느낌
    actionToPlay.timeScale =
        (mappedAction === 'left_pending' || mappedAction === 'right_pending') ? 0.5 : 1.0;
    actionToPlay.reset().fadeIn(0.3).play();
}
```

모든 클립을 0.2초에 걸쳐 페이드아웃하고, 새 클립을 0.3초 페이드인합니다. 상대가 말하는 동안의 대기 모션은 `timeScale = 0.5`로 느리게 재생해 **가만히 듣고 있는 느낌**을 만듭니다.

### 5-7. R3F 씬 구성 (`AvatarScene.tsx`)

```tsx
<Canvas
    orthographic                      // 원근 왜곡 없는 정면 뷰
    camera={{ zoom: 135, near: 1, far: 50, position: [0, 0, 45] }}
    gl={{ preserveDrawingBuffer: true, antialias: true,
          powerPreference: 'high-performance' }}
>
    <ambientLight intensity={0.3} />
    <directionalLight position={[3, 0, 5]} intensity={3} castShadow ... />
    <directionalLight position={[-10, 0, 1]} intensity={0.4} />
    <Suspense fallback={null}>
        <ModelController ... />
    </Suspense>
</Canvas>
```

- **직교 카메라(orthographic)**: 얼굴이 카메라 거리에 따라 왜곡되지 않아 캐릭터 일러스트 느낌을 유지합니다
- **강한 정면광 + 약한 측면광**: 3D 렌더처럼 보이지 않고 평면 일러스트에 가깝게 만드는 조명 구성
- **`ResizeObserver`**: 컨테이너 폭에 따라 카메라 줌을 조정
- **WebGL context lost 복구**: 컨텍스트 유실 시 `key`를 증가시켜 Canvas를 강제 재마운트

```ts
const handleContextLost = (event: Event) => {
    event.preventDefault();
    setTimeout(() => setKey(prev => prev + 1), 100);   // Canvas 재생성
};
```

한 화면에 3D Canvas가 2개(대화방) 또는 2개 이상(온보딩 동료 소개) 동시에 뜨기 때문에, GPU 리소스 부족으로 컨텍스트가 유실되는 상황을 실제로 겪고 넣은 방어 코드로 보입니다.

**모델 클론**: 각 `Avatar_*.jsx`는 GLB를 `SkeletonUtils.clone`으로 복제합니다.

```jsx
const { scene } = useGLTF('/models/sanggyun.glb')
const cloned = useMemo(() => clone(scene), [scene])
return <primitive object={cloned} ref={ref} {...props} />
```

`useGLTF`는 같은 경로의 씬을 캐싱해 공유하므로, 클론하지 않으면 같은 모델이 여러 곳에 뜰 때 서로의 애니메이션 상태를 덮어씁니다. React StrictMode의 이중 마운트에서도 문제가 생깁니다.

---

## 6. 상태 관리 전략

TeamTalk은 **Redux, Zustand 같은 전역 상태 라이브러리를 쓰지 않습니다.** 대신 세 계층으로 나눠 관리합니다.

| 계층 | 저장소 | 담는 것 | 수명 |
| --- | --- | --- | --- |
| 세션 | **localStorage** | `chatSession`, `session_id`, `selectedRole`, `selectedScenario` | 브라우저 종료 후에도 유지 |
| 화면 간 | **URL 쿼리스트링** | `?role=`, `?agentA=`, `?agentB=` | 페이지 전환 시 |
| 화면 내 | **useState** | 메시지, 재생 큐, 립싱크, 로딩 | 컴포넌트 생명주기 |

**localStorage를 세션 저장소로 쓴 이유**: 대화방을 새로고침해도 어떤 세션인지 잃지 않아야 하는데, 매번 Supabase를 조회하면 지연이 생깁니다. 온보딩에서 확정된 정보(session_id, 내 직군, 동료 직군)는 대화 중 바뀌지 않으므로 클라이언트에 캐싱하는 것이 합리적입니다.

**한계**: `ConversationRoom` 진입 시 세션이 없으면 `alert`만 띄우고 **리다이렉트는 주석 처리되어 있습니다**.

```ts
if (!savedSession) {
    alert("세션 정보가 없습니다. 다시 시작해주세요.");
    // router.push("/OnboardingFirstPage");   ← 비활성화
}
```

이 상태로 진행하면 이후 `sendChatMessage`가 예외를 던집니다.

---

## 7. n8n 호출 (`utils/api/fetchChat.ts`)

```ts
const body: Chat = {
    session_id:   session.session_id,
    sender_role:  session.sender_role,
    is_user:      true,
    content:      content,
    worker1_role: session.worker1_role,
    worker2_role: session.worker2_role,
};

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 480000);   // 8분

const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/webhook/expert-models`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
});
```

**타임아웃이 480초(8분)입니다.** 응답이 3분 걸리는 시스템이기 때문에 넉넉하게 잡았습니다. `chat-proxy.ts`의 `maxDuration: 480`도 같은 값입니다.

> 이 함수는 **브라우저에서 n8n을 직접 호출**합니다. `chat-proxy.ts` 프록시를 경유하지 않습니다. 그래서 n8n 워크플로에 CORS preflight 처리가 필요했습니다. 상세는 [02. 아키텍처](02-architecture.md#6-cors-배포-후-요청이-막힌-이유)를 참고하십시오.

`console.log`가 다수 남아 있습니다 (`📤 전송할 데이터`, `📥 응답 텍스트` 등). 디버깅 흔적입니다.

---

## 8. 재사용 컴포넌트

### `RoleConfig` 기반 컴포넌트

| 컴포넌트 | 용도 | 특징 |
| --- | --- | --- |
| `WhiteBlock` | 직군 선택 카드 | `role`만 받아 아이콘·이름을 `RoleConfig`에서 조회 |
| `AvatarBlock` | 동료 소개 카드 | 3D 아바타 + 성격 + 관심사를 한 카드에 |
| `RoleBadge` | 직군 배지 | 테마 컬러 적용 |

세 컴포넌트 모두 **`role: Role` prop 하나만 받습니다.** 나머지는 전부 `RoleConfig`에서 가져오므로, 직군 데이터가 바뀌어도 컴포넌트를 고칠 필요가 없습니다.

`as` prop으로 렌더링 태그를 `div` / `button`으로 바꿀 수 있어, 선택 가능한 카드와 표시 전용 카드를 같은 컴포넌트로 처리합니다.

### 말풍선 (`ChatBubble.tsx`)

`UserBubble` / `AgentABubble` / `AgentBBubble` 세 종류를 export합니다. **에이전트 말풍선만 `TypingText`로 한 글자씩 타이핑되며 나타납니다.** 사용자 말풍선은 즉시 표시됩니다 — 자기가 방금 친 글자가 타이핑되는 것은 부자연스럽기 때문입니다.

### 연출 컴포넌트

| 컴포넌트 | 효과 | 사용처 |
| --- | --- | --- |
| `TextScramble` (HoverScramble) | 호버 시 글자가 뒤섞이며 다른 텍스트로 | 버튼 (`ENTER` → `GO`) |
| `InitialScrambleText` | 마운트 시 스크램블 후 확정 | 아바타 이름 표시 |
| `TypingText` | 한 글자씩 타이핑 | 말풍선, 에이전트 설명 |
| `SplitText` | 글자 단위 등장 | 랜딩 타이틀 |
| `CircularText` | 원형 회전 텍스트 | 랜딩 배경 |
| `Aurora` | OGL 기반 그라디언트 배경 | 레이아웃 (현재 주석 처리) |
| `LoadingComponent` | 에이전트별 로딩 인디케이터 | 대화방 |

---

## 9. 미사용 · 잔존 코드

정리 시 참고할 목록입니다. 상세 설명은 [08. 알려진 이슈](08-known-issues.md)에 있습니다.

| 파일 | 상태 |
| --- | --- |
| `src/app/ChooseAgent/` | v1 에이전트 선택 화면. 어떤 경로에서도 도달 불가 |
| `src/app/slideData.tsx` | v1 성향 기반 4 페르소나. `ChooseAgent`에서만 사용 |
| `src/pages/api/chat-proxy.ts` | 프록시. 정의되어 있으나 호출되지 않음 |
| `src/pages/api/questions.ts` | `localhost:8000/questions/chat` 호출 — 백엔드에 없는 엔드포인트 |
| `src/app/ConversationRoom/hooks/useChatSession.tsx` | 정의되어 있으나 호출되지 않음 |
| `src/app/utils/playAudioWithLipSync.ts` | `ModelController` 내부 구현과 중복 |
| `src/app/utils/LipSyncTiming.ts` | 전체 주석 처리 |
| `src/app/Components/Avatar/motion/LipSyncWrapper.tsx` | 전체 주석 처리 |
| `src/app/Components/Avatar/motion/LipSyncAvatar.tsx` | 전체 주석 처리 |
| `src/data/role.json` | 전체 주석 처리 |
| `src/app/Components/Avatar/Avatar_Gemini.jsx` | `chaeyoung.glb` 로더. `RoleConfig`에 없어 v1 경로에서만 사용 |
| `src/app/Components/GSAP/CustomCursor.tsx` | `layout.tsx`에서 주석 처리 |
| `src/app/Components/ReactBits/Aurora.tsx` | `layout.tsx`에서 주석 처리 |

---

| ← | → |
| --- | --- |
| [02. 시스템 아키텍처](02-architecture.md) | [04. 백엔드 (TTS)](04-backend.md) |
