# 06. 데이터 모델

> [← 05. n8n 워크플로](05-n8n-workflow.md) · [문서 인덱스](../README.md)

**저장소**: 셀프호스팅 Supabase (내부 PostgreSQL)

---

## 1. 스키마 전체

<p align="center">
  <img src="img/teamtalk-DB%20%EA%B5%AC%EC%A1%B0.png" width="900" alt="Supabase 테이블 구조" />
</p>

```
   users  ──1:N──→  sessions  ──1:N──→  conversations
                                            
   n8n_chat_histories   (n8n Memory 노드 소유 · 애플리케이션 스키마와 분리)
   antidigital_djf      (미사용 / 잔존)
```

| 테이블 | 소유 주체 | 역할 |
| --- | --- | --- |
| `users` | 애플리케이션 | 사용자 프로필 |
| `sessions` | 애플리케이션 | 대화방 1개 = 세션 1개. 참여 직군과 시나리오를 확정 |
| `conversations` | 애플리케이션 | 발화 단위 대화 로그 |
| `n8n_chat_histories` | **n8n** | Memory 노드가 자동 관리하는 LLM 컨텍스트 |
| `antidigital_djf` | — | 컬럼 정의 없음. 사용되지 않음 |

---

## 2. 테이블 상세

### 2-1. `users` — 사용자

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| `id` | `int4` | **PK** | 내부 사용자 ID |
| `user_email` | `varchar` | **UNIQUE** | 이메일. Supabase Auth와 연결하는 키 |
| `user_password` | `varchar` | | 🚨 **평문 저장** |
| `user_name` | `varchar` | | 표시 이름 |
| `created_at` | `timestamp` | | 가입 시각 |
| `last_login` | `timestamp` | | 마지막 로그인 시각 |

**Supabase Auth와의 관계**

인증 자체는 Supabase Auth의 `auth.users`가 담당하고, 이 `public.users` 테이블은 **애플리케이션 프로필**을 담습니다. 두 테이블은 **`user_email`로만 느슨하게 연결**되어 있습니다.

```ts
// 회원가입 — src/app/login/page.tsx
await supabase.auth.signUp({ email, password });     // ① auth.users 생성
await supabase.from("users").insert({                 // ② public.users 생성
    user_email: email,
    user_password: password,   // 🚨 평문
    user_name: name,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
});
```

```ts
// 세션 생성 시 내부 id 조회 — src/app/OnboardingSecondPage/page.tsx
const { data: { user } } = await supabase.auth.getUser();
const { data: userData } = await supabase
    .from('users').select('id').eq('user_email', user.email).single();
const userId = userData.id;
```

> ⚠️ **`auth.users.id`(UUID)를 FK로 쓰지 않고 별도 `int4` PK를 둔 구조**입니다. 그래서 세션을 만들 때마다 이메일로 내부 id를 조회하는 왕복이 한 번 더 발생합니다. Supabase의 표준 패턴은 `public.users.id`를 `auth.users.id`와 동일한 UUID로 두고 FK를 거는 것입니다.

> 🚨 **`user_password` 컬럼은 존재 자체가 문제입니다.** Supabase Auth가 이미 비밀번호를 안전하게 해싱해 관리하므로 이 컬럼은 불필요하고, 평문 저장은 유출 시 피해가 큽니다. 상세는 [08. 알려진 이슈](08-known-issues.md#6-비밀번호-평문-저장)를 참고하십시오.

---

### 2-2. `sessions` — 대화방

**TeamTalk의 중심 테이블입니다.** "누가, 어떤 동료와, 어떤 상황을 연습하는가"가 여기서 확정됩니다.

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| `id` | `int4` | **PK** | 세션 ID |
| `user_id` | `int4` | → `users.id` | 세션 소유자 |
| `user_role` | `role_type` | ENUM | 사용자가 고른 직군 |
| `worker1_role` | `role_type` | ENUM | 동료 1의 직군 |
| `worker2_role` | `role_type` | ENUM | 동료 2의 직군 |
| `scenario_type` | `scenario_type` | ENUM | 선택한 시나리오 |
| `session_description` | `text` | | 시나리오 설명 스냅샷 |
| `created_at` | `timestamp` | | 생성 시각 |
| `updated_at` | `timestamp` | | 수정 시각 |

**세 개의 role 컬럼이 곧 대화방의 참여자 구성**입니다. `user_role`은 사용자 자신, `worker1_role` / `worker2_role`은 자동 배정된 두 에이전트입니다. 이 세 값은 세션 생성 시 확정되고 이후 바뀌지 않습니다.

**INSERT 시점** — `src/app/OnboardingSecondPage/page.tsx`

```ts
const { data: sessionData } = await supabase.from('sessions').insert({
    user_id:             userId,
    user_role:           roleToKorean(roleParam),   // "개발자"
    worker1_role:        roleToKorean(agentA),      // "기획자"
    worker2_role:        roleToKorean(agentB),      // "디자이너"
    scenario_type:       scenarioType,              // "시나리오1"
    session_description: selectedScenario.description,
}).select('id').single();
```

**`session_description`을 스냅샷으로 저장하는 이유**: `src/data/senario.json`의 시나리오 문구가 나중에 바뀌더라도, 과거 세션이 어떤 상황을 연습한 것이었는지 그대로 남습니다. 정규화하면 `scenario_type`만으로 충분하지만, **당시의 설명을 보존**하는 쪽을 택했습니다.

**커스텀 ENUM 타입 2종**

```sql
-- role_type  : 직군 (한글)
'사용자' | '개발자' | '기획자' | '디자이너'

-- scenario_type : 시나리오
'시나리오1' | '시나리오2' | '시나리오3'
```

> ENUM으로 정의해 오타나 잘못된 값이 DB 레벨에서 차단됩니다. 다만 **한글 값을 ENUM으로 굳혀둔 탓에** 프론트엔드 enum(영문)과의 변환이 항상 필요해집니다 (아래 4절 참고).

> `scenario_type`이 `'시나리오1'` 같은 **순번 문자열**이라, `senario.json`의 배열 순서가 바뀌면 과거 데이터의 의미가 달라집니다. `'해커톤_팀빌딩'` 같은 의미 기반 키였다면 안전했을 부분입니다.

---

### 2-3. `conversations` — 대화 로그

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| `id` | `int4` | **PK** | 발화 ID |
| `session_id` | `int4` | → `sessions.id` | 소속 세션 |
| `sender_role` | `role_type` | ENUM | 발화자 직군 |
| `is_user` | `bool` | | `true`=사용자, `false`=에이전트 |
| `content` | `text` | | 발화 내용 |
| `created_at` | `timestamp` | | 발화 시각 |

**사용자와 에이전트 발화를 한 테이블에 저장**하고 `is_user`로 구분합니다.

**INSERT 주체는 전부 n8n입니다.** 프론트엔드는 이 테이블에 직접 쓰지 않습니다.

| n8n 노드 | 저장 대상 | `is_user` |
| --- | --- | --- |
| `Create a row-user content` | 사용자 발화 | `true` |
| `Create a row agent content3` | 1라운드 에이전트 응답 | `false` |
| `Create a row agent content` | 2라운드 에이전트 응답 | `false` |

**읽기 주체도 n8n입니다** (`Get AI Responses`). 응답을 저장한 뒤 다시 읽어 프론트엔드로 반환하는 구조라, DB에 남은 내용과 화면에 뜬 내용이 항상 일치합니다.

> `sender_role`과 `is_user`는 사실상 중복 정보입니다. `sender_role`이 세션의 `user_role`과 같으면 사용자 발화이기 때문입니다. 다만 조회 시 조인 없이 판별할 수 있어 실용적인 비정규화입니다.

---

### 2-4. `n8n_chat_histories` — LLM 컨텍스트

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `int4` | PK |
| `session_id` | **`varchar`** | 세션 식별자 — ⚠️ 문자열 |
| `message` | `jsonb` | LangChain 메시지 객체 |

**n8n의 Postgres Chat Memory 노드가 자동으로 생성하고 관리하는 테이블**입니다. 스키마를 우리가 정의한 게 아니라 n8n이 정의합니다.

**`conversations`와 무엇이 다른가**

| | `conversations` | `n8n_chat_histories` |
| --- | --- | --- |
| 소유 | 애플리케이션 | n8n |
| 스키마 정의 | 우리 | n8n / LangChain |
| `session_id` 타입 | `int4` | **`varchar`** |
| 내용 | 정제된 발화 | LangChain 메시지 객체 (role, content, 메타데이터 포함) |
| 용도 | 화면 표시, 응답 조립 | **LLM 컨텍스트 주입** |
| 다른 테이블과의 FK | `sessions`와 연결 | **연결 없음** |

같은 대화가 두 테이블에 이중 저장되지만 목적이 다릅니다. 하나는 **애플리케이션 데이터**, 하나는 **모델의 기억**입니다.

> ⚠️ `session_id` 타입이 다릅니다(`varchar` vs `int4`). n8n이 세션 키를 문자열로 다루기 때문인데, 그래서 이 테이블은 **FK 제약 없이 논리적으로만 연결**됩니다. 두 테이블을 조인하려면 캐스팅이 필요합니다.

---

### 2-5. `antidigital_djf`

컬럼 정의가 없고 어디에서도 참조되지 않습니다. 실험 흔적으로 보입니다.

---

## 3. 관계도

```
users
  │ id (PK)
  │
  └─ 1:N ─→ sessions
              │ id (PK)
              │ user_id (FK → users.id)
              │ user_role, worker1_role, worker2_role  : role_type
              │ scenario_type                          : scenario_type
              │
              └─ 1:N ─→ conversations
                          │ id (PK)
                          │ session_id (FK → sessions.id)
                          │ sender_role : role_type
                          │ is_user     : bool
                          └ content

n8n_chat_histories        ← FK 없음. session_id(varchar)로만 논리적 연결
antidigital_djf           ← 미사용
```

---

## 4. role 표기 컨벤션

**TeamTalk에서 가장 주의해야 할 부분입니다.** 직군 표기가 계층마다 다릅니다.

| 계층 | 표기 | 예 | 근거 |
| --- | --- | --- | --- |
| 프론트엔드 `Role` enum | **영문** | `"developer"` | `src/app/types/enum.ts` |
| URL 쿼리스트링 | **영문** | `?agentA=planner` | `router.push` |
| `localStorage.chatSession` | **한글** | `"기획자"` | `OnboardingSecondPage` |
| n8n 요청 body | **한글** | `"기획자"` | `fetchChat.ts` |
| **DB (`role_type` ENUM)** | **한글** | `'기획자'` | 스키마 정의 |
| n8n 응답 `ai_role` | **한글** | `"기획자"` | n8n |
| 화면 렌더링 | **영문 → ChatRole** | `ChatRole.AgentA` | `handleSendMessage` |

### 변환 지점

```
                    [ Role enum: "planner" ]
                              │
              roleToKorean ───┤                 src/app/config/mapKorean.ts
                              ↓
                     [ 한글: "기획자" ]
                              │
                    localStorage / n8n / DB
                              │
                              ↓
                     [ 한글: "기획자" ]
                              │
            getRoleByKorean ──┤                 ConversationRoom/utils/getRoleByKorean.ts
                              ↓
                    [ Role enum: "planner" ]
                              │
                   agentA/agentB와 비교
                              ↓
                 [ ChatRole.AgentA / AgentB ]
```

**정변환** — `src/app/config/mapKorean.ts`

```ts
const roleToKorean: Record<Role, string> = {
  [Role.User]:      '사용자',
  [Role.Developer]: '개발자',
  [Role.Designer]:  '디자이너',
  [Role.Planner]:   '기획자',
};
```

**역변환** — `src/app/ConversationRoom/utils/getRoleByKorean.ts`

```ts
export function getRoleByKorean(korean: string): Role | undefined {
    const entry = Object.entries(roleToKorean).find(([, value]) => value === korean);
    return entry ? (entry[0] as Role) : undefined;
}
```

### 왜 이렇게 되었나

**DB의 `role_type` ENUM이 한글로 정의**되어 있는 것이 출발점입니다. n8n이 DB에 직접 쓰기 때문에 n8n 구간도 한글이어야 하고, 따라서 프론트엔드가 n8n으로 보낼 때 한글로 변환해야 합니다.

한글 ENUM의 장점은 **DB를 직접 열어봤을 때 바로 읽힌다**는 점입니다. Supabase Studio로 데이터를 확인하며 개발하는 워크플로에서는 실질적인 이점이었습니다.

### 이 컨벤션의 위험

| 위험 | 결과 |
| --- | --- |
| **조용한 실패** | `getRoleByKorean`이 `undefined`를 반환하면 에이전트 메시지가 `ChatRole.User`로 떨어져 **사용자 말풍선으로 렌더링**됩니다. 에러가 나지 않고 잘못 표시됩니다 |
| **매핑 중복** | `mapKorean.ts`와 `OnboardingSecondPage` 내부에 **같은 매핑이 두 번** 정의되어 있습니다. 한쪽만 수정하면 불일치 발생 |
| **타입 안전성 상실** | 한글 문자열 구간에서는 TypeScript가 오타를 잡아주지 못합니다 |
| **다국어 확장 불가** | 표시 언어를 바꾸려면 DB ENUM까지 바꿔야 합니다 |

**개선 방향**: DB ENUM을 영문(`'developer'`)으로 두고, 한글은 **화면 표시 시점에만** 변환하는 것이 정석입니다. 그러면 전 계층이 영문 enum으로 통일되고 변환 지점이 UI 한 곳으로 줄어듭니다.

> `OnboardingSecondPage`의 중복 매핑은 [08. 알려진 이슈](08-known-issues.md#11-role-한글-매핑이-두-곳에-중복)에 정리했습니다.

---

## 5. 세션 데이터의 클라이언트 캐싱

세션 정보는 DB와 별개로 **localStorage에도 저장**됩니다.

| 키 | 값 | 저장 위치 |
| --- | --- | --- |
| `selectedRole` | `"developer"` (영문) | `OnboardingFirstPage` |
| `selectedScenario` | 시나리오 객체 JSON | `OnboardingSecondPage` |
| `session_id` | `"12"` (문자열) | `OnboardingSecondPage` |
| `chatSession` | `{ session_id, sender_role, is_user, worker1_role, worker2_role }` — role은 **한글** | `OnboardingSecondPage` |

```ts
const chatSessionData = {
    session_id:   sessionId,
    sender_role:  roleToKorean(roleParam),
    is_user:      true,
    worker1_role: roleToKorean(agentA),
    worker2_role: roleToKorean(agentB),
};
localStorage.setItem('chatSession', JSON.stringify(chatSessionData));
```

`ConversationRoom`에서 메시지를 보낼 때 이 값을 그대로 읽어 n8n 요청 body를 만듭니다 (`fetchChat.ts`). **DB를 다시 조회하지 않습니다** — 세션 정보는 생성 후 바뀌지 않으므로 캐싱이 안전하고, 매 전송마다 왕복을 줄일 수 있습니다.

> ⚠️ `ChatSession` 인터페이스는 `sender_role: Role`(영문 enum)로 선언되어 있지만, 실제로 저장되는 값은 **한글 문자열**입니다. 타입 선언과 런타임 값이 어긋나 있습니다. TypeScript가 `JSON.parse` 결과를 검사하지 않기 때문에 컴파일 시점에 드러나지 않습니다.

> ⚠️ 인터페이스에 있는 `room_name` 필드는 실제로 저장되지 않습니다. `OnboardingFirstPage`에 방 이름 입력 UI가 주석 처리된 채 남아 있는 것으로 보아, 구현하려다 뺀 기능입니다.

---

## 6. 전형적인 데이터 흐름

한 세션이 만들어지고 대화가 오가는 전체 과정입니다.

```
① 회원가입
   supabase.auth.signUp()          → auth.users        (Supabase Auth)
   supabase.from('users').insert() → public.users      (프론트엔드)

② 로그인
   supabase.auth.signInWithPassword()
   users.last_login 갱신                                (프론트엔드)

③ 온보딩 — 직군 선택
   localStorage.selectedRole = "developer"

④ 온보딩 — 시나리오 선택 + 세션 생성
   users.select('id').eq('user_email', ...)             (프론트엔드)
   sessions.insert({ user_id, user_role, worker1_role,
                     worker2_role, scenario_type,
                     session_description })  → id       (프론트엔드)
   localStorage.session_id, localStorage.chatSession

⑤ 대화 — 사용자 발화
   POST /webhook/expert-models                          (프론트 → n8n)
   conversations.insert({ ..., is_user: true })         (n8n)

⑥ 대화 — 에이전트 응답
   n8n_chat_histories 읽기/쓰기                          (n8n Memory 노드)
   conversations.insert({ ..., is_user: false }) × 0~2  (n8n)

⑦ 응답 반환
   conversations 조회 → 포맷 → Respond to Webhook        (n8n)
```

**쓰기 주체가 이원화되어 있습니다.**

- **프론트엔드가 쓰는 것**: `users`, `sessions` — 사용자·세션 관리
- **n8n이 쓰는 것**: `conversations`, `n8n_chat_histories` — 대화 로그

이 분리는 자연스럽습니다. 세션 생성은 사용자 인증 컨텍스트가 필요하고(프론트엔드가 auth 세션을 가짐), 대화 저장은 에이전트 실행 컨텍스트가 필요하기(n8n이 응답을 만듦) 때문입니다.

---

## 7. 스키마 평가

| 잘한 점 | 아쉬운 점 |
| --- | --- |
| ENUM 타입으로 잘못된 값을 DB 레벨에서 차단 | ENUM 값이 한글이라 전 계층 변환이 필요 |
| `session_description` 스냅샷으로 과거 맥락 보존 | `scenario_type`이 순번 기반이라 순서 변경에 취약 |
| 세션에 참여자 구성을 확정해 대화 중 변동 없음 | `auth.users`와 `public.users`가 이메일로만 연결 |
| 사용자/에이전트 발화를 한 테이블로 통합 관리 | `user_password` 컬럼 자체가 불필요하고 위험 |
| 쓰기 주체가 계층별로 명확히 분리 | `n8n_chat_histories`와 `conversations` 이중 저장 |
| | RLS(Row Level Security) 정책 미확인 |

**RLS 관련**: Supabase의 핵심 보안 기능인 Row Level Security 정책이 설정되어 있는지 이 리포지토리에서는 확인할 수 없습니다. 프론트엔드가 anon key로 `users`·`sessions`를 직접 조회·삽입하는 구조이므로, **RLS가 없다면 다른 사용자의 데이터에 접근 가능**합니다. 상세는 [08. 알려진 이슈](08-known-issues.md#12-rls-정책-미확인)를 참고하십시오.

---

| ← | → |
| --- | --- |
| [05. n8n 워크플로](05-n8n-workflow.md) | [07. 실행 및 배포](07-setup.md) |
