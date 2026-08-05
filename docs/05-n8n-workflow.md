# 05. n8n 워크플로 — 멀티에이전트 오케스트레이션

> [← 04. 백엔드 (TTS)](04-backend.md) · [문서 인덱스](../README.md)

---

> **문서화 범위 안내**
> n8n 워크플로는 코드가 아니라 n8n 인스턴스 안의 시각적 그래프로 존재합니다. 이 문서는 **워크플로 스크린샷과 프론트엔드가 실제로 주고받는 요청/응답 형태**를 근거로 작성했습니다. 개별 노드의 프롬프트 문구나 파라미터 값 같은 내부 설정은 이 리포지토리에 없으므로 다루지 않습니다.

---

## 1. 전체 워크플로

<p align="center">
  <img src="img/teamtalk-n8n%20%EC%9B%8C%ED%81%AC%ED%94%8C%EB%A1%9C.png" width="1000" alt="n8n 워크플로 전체" />
</p>

TeamTalk의 핵심 로직이 전부 여기 있습니다. **"질문 하나를 받아 두 에이전트가 토론하듯 답하고 그 결과를 저장해 돌려준다"**는 흐름이 하나의 워크플로로 구현되어 있습니다.

크게 **6단계**입니다.

```
① 진입 및 CORS 처리       Webhook1 → Check if OPTIONS → (Respond to OPTIONS)
② 사용자 발화 저장         Create a row-user content
③ 오케스트레이션 (판단)     AI Agent-orchestrator + Structured Output Parser
④ 1라운드 (에이전트 발화)   Switch → planner / designer / developer → Create a row
⑤ 2라운드 (반응 발화)      Switch3 → planner3 / designer3 / developer3 → Create a row
⑥ 응답 조립 및 반환        Get AI Responses → Format Final Response → Respond to Webhook
```

---

## 2. 단계별 상세

### ① 진입 및 CORS 처리

```
Webhook1 (POST)
    ↓
Check if OPTIONS ─── true ──→ Respond to OPTIONS   ← 여기서 종료
                  └─ false ─→ ② 로 계속
```

**왜 이 분기가 존재하는가**

프론트엔드가 **브라우저에서 n8n을 직접 호출**하기 때문입니다 (`src/app/utils/api/fetchChat.ts`). 프론트 도메인과 n8n 도메인이 다르므로 cross-origin이고, `Content-Type: application/json`인 POST는 단순 요청이 아니라 브라우저가 본 요청 전에 **OPTIONS preflight를 먼저 보냅니다.**

n8n 웹훅 노드는 기본적으로 POST만 받도록 되어 있어, preflight가 처리되지 않으면 본 요청이 아예 시작되지 못합니다. 배포 후 프론트 요청이 전부 막혔던 원인이 이것이었고, 해결책으로 워크플로 진입부에 OPTIONS 분기를 넣었습니다.

> 로컬 개발에서는 origin 관계가 달라 문제가 드러나지 않았고, 배포 후에야 표면화된 케이스입니다. 배경 설명은 [02. 아키텍처](02-architecture.md#6-cors-배포-후-요청이-막힌-이유)를 참고하십시오.

**요청 body** (`src/app/types/interface.ts`의 `Chat` 인터페이스)

```json
{
  "session_id": 12,
  "sender_role": "개발자",
  "is_user": true,
  "content": "이번 스프린트에 이 기능 넣을 수 있을까요?",
  "worker1_role": "기획자",
  "worker2_role": "디자이너"
}
```

| 필드 | 설명 |
| --- | --- |
| `session_id` | Supabase `sessions.id`. 온보딩에서 생성 |
| `sender_role` | 사용자가 고른 직군 (**한글**) |
| `is_user` | 항상 `true` (현재 하드코딩) |
| `content` | 사용자 입력 |
| `worker1_role` | 동료 1의 직군 (**한글**) |
| `worker2_role` | 동료 2의 직군 (**한글**) |

> role이 **한글로 전달됩니다.** n8n·DB 전 구간이 한글 표기를 씁니다. 자세한 이유와 변환 지점은 [06. 데이터 모델](06-data-model.md#4-role-표기-컨벤션)을 참고하십시오.

---

### ② 사용자 발화 저장 — `Create a row-user content`

Supabase 노드가 사용자 입력을 `conversations` 테이블에 INSERT합니다.

```
conversations
  session_id  ← 요청의 session_id
  sender_role ← 요청의 sender_role
  is_user     ← true
  content     ← 요청의 content
```

**오케스트레이터를 호출하기 전에 저장합니다.** 이후 단계에서 실패하더라도 사용자 발화는 유실되지 않습니다.

---

### ③ 오케스트레이션 — `AI Agent-orchestrator`

**이 워크플로의 핵심입니다.**

```
                 ┌─ OpenAI Chat Model      (Chat Model)
AI Agent-        ├─ Postgres Chat Memory1  (Memory)
orchestrator ────┤
                 └─ Structured Output Parser1  (Output Parser)
                          ↓
                  { 누가 / 순서 / 답할지 말지 }
```

오케스트레이터는 매 턴마다 다음을 판단합니다.

- **어느 에이전트가 답할 것인가**
- **답을 할 것인가 말 것인가**
- **순서는 어떻게 할 것인가**

**연결된 서브 노드 3개**

| 노드 | 역할 | 왜 이걸 썼나 |
| --- | --- | --- |
| **OpenAI Chat Model** | 판단을 수행하는 모델 | 역할 에이전트는 로컬 Ollama를 쓰는데 **오케스트레이터만 OpenAI**입니다. 턴 판단은 구조화된 JSON을 안정적으로 뱉어야 하는데, 7~8B LoRA 모델로는 스키마를 일관되게 만족시키기 어려웠습니다. **제어 계층만 외부 모델, 생성 계층은 로컬 모델**이라는 절충입니다. |
| **Postgres Chat Memory1** | 대화 히스토리 | `session_id` 기준으로 이전 맥락을 불러옵니다. 저장 위치는 `n8n_chat_histories` 테이블 |
| **Structured Output Parser1** | 출력 스키마 강제 | 자유 텍스트가 아니라 Switch 노드가 분기에 쓸 수 있는 **구조화된 JSON**으로 받습니다 |

**설계상 중요한 점**: Structured Output Parser가 있기 때문에 오케스트레이터의 출력이 곧바로 라우팅 조건이 됩니다. 판단(모델)과 분기(n8n Switch)가 깔끔하게 분리됩니다.

> **모델 판단 + 규칙 분기의 결합**입니다. 순수 규칙 기반이면 "이 질문은 디자이너가 답할 일이 아니다" 같은 맥락 판단을 못 하고, 순수 모델 기반이면 실행 흐름을 통제하기 어렵습니다. 오케스트레이터가 판단하고 n8n Switch가 실행하는 구조로 양쪽을 나눴습니다.

---

### ④ 1라운드 — 첫 번째 에이전트 발화

```
                    ┌──→ AI Agent-planner   ←─ Ollama Chat Model10
Switch (mode: Rules)├──→ AI Agent-designer  ←─ Ollama Chat Model9
                    └──→ AI Agent-developer ←─ Ollama Chat Model8
                                ↓
                     Create a row agent content3
```

**Switch 노드**가 오케스트레이터의 판단 결과에 따라 세 역할 중 하나로 라우팅합니다. 각 에이전트는 **자기 전용 Ollama Chat Model 노드**를 갖습니다 — 역할별로 다른 LoRA 모델을 서빙하기 때문입니다.

에이전트 노드들도 오케스트레이터와 같은 **`Postgres Chat Memory1`을 공유**합니다 (스크린샷의 점선 연결). 세션 단위 대화 맥락을 모두가 함께 봅니다.

생성된 응답은 `Create a row agent content3`로 `conversations` 테이블에 저장됩니다.

```
conversations
  session_id  ← 동일 세션
  sender_role ← 발화한 에이전트의 직군 (한글)
  is_user     ← false
  content     ← 에이전트 응답
```

---

### ⑤ 2라운드 — 두 번째 에이전트의 반응

```
                     ┌──→ AI Agent-planner3   ←─ Ollama Chat Model12
Switch3 (mode: Rules)├──→ AI Agent-designer3  ←─ Ollama Chat Model11
                     └──→ AI Agent-developer3 ←─ Ollama Chat Model1
                                ↓
                      Create a row agent content
```

**1라운드와 구조는 같지만 입력이 다릅니다.** 2라운드 에이전트는 사용자 입력만이 아니라 **1라운드 에이전트의 출력도 함께 받습니다.**

이것이 TeamTalk을 "답이 두 개 나오는 챗봇"이 아니라 **토론**으로 만드는 지점입니다. 스크린샷에서 확인할 수 있듯 실제 화면의 대화가 다음처럼 흘러갑니다.

```
Dune(기획자): "안녕하세요, 자기소개를 해볼까요? 저는 Dune입니다."
Soni(디자이너): "안녕하세요, 저는 Soni입니다. 잘부탁드립니다! 당신은 누구신가요?"
                 └─ Dune의 발화를 받아 반응하고 있음
```

> 노드 이름이 `planner` / `planner3`처럼 접미사만 다른 것은, **동일 구조를 라운드마다 복제**했기 때문입니다. n8n의 GUI 기반 특성상 서브그래프 재사용이 어려워 생긴 중복입니다. 코드 기반 오케스트레이션(LangGraph 등)이었다면 함수 하나를 두 번 호출했을 부분입니다.

---

### ⑥ 응답 조립 및 반환

```
Get AI Responses (getAll: row)
        ↓
Format Final Response  { }
        ↓
Respond to Webhook
```

`Get AI Responses`가 이번 턴에 저장된 에이전트 응답들을 `conversations`에서 조회하고, `Format Final Response`(Code 노드)가 프론트엔드가 기대하는 형태로 가공합니다.

**응답 스키마** (`src/app/types/interface.ts`의 `ResponseChatResponse`)

```json
{
  "success": true,
  "session_id": 12,
  "messages": [
    {
      "ai_role":    "기획자",
      "content":    "그 기능, 사용자 입장에서 어떤 문제를 푸는 건가요?",
      "created_at": "2025-10-20T14:32:11.000Z"
    },
    {
      "ai_role":    "디자이너",
      "content":    "저도 궁금해요. 다만 화면 흐름상 여기에 넣으면 동선이 꼬일 것 같은데요.",
      "created_at": "2025-10-20T14:32:47.000Z"
    }
  ]
}
```

| 필드 | 설명 |
| --- | --- |
| `success` | 성공 여부. 프론트가 이 값과 `messages` 길이를 함께 검사 |
| `session_id` | 세션 식별자 |
| `messages[].ai_role` | 발화자 직군 (**한글**) — 프론트가 `getRoleByKorean`으로 역변환 |
| `messages[].content` | 응답 텍스트 |
| `messages[].created_at` | 생성 시각 |

**DB에 저장한 뒤 다시 조회해서 반환하는 구조**입니다. 저장과 응답의 내용이 반드시 일치하고, `created_at`을 DB가 생성한 값으로 쓸 수 있습니다.

---

## 3. 턴 제어와 종료 보장

멀티에이전트 시스템에서 가장 위험한 실패 모드는 **대화가 끝나지 않는 것**입니다. A가 답하면 B가 반응하고, B의 반응에 A가 다시 반응하면 무한 루프가 됩니다.

TeamTalk의 해법은 단순합니다.

> **선택된 각 에이전트는 한 턴에 최소 0회, 최대 1회만 발화한다.**

```
한 턴에 가능한 경우의 수

  ┌─ 둘 다 발화        →  messages.length === 2
  ├─ 한쪽만 발화       →  messages.length === 1
  └─ 둘 다 발화 안 함  →  messages.length === 0
```

**얻는 것**

| | 내용 |
| --- | --- |
| **유한 종료 보장** | 최대 2회 발화 후 반드시 끝남. 루프 감지나 최대 턴 수 카운터가 불필요 |
| **응답 시간 상한** | 최악의 경우에도 모델 호출 3회(오케스트레이터 1 + 에이전트 2). 3분이라는 지연이 예측 가능 |
| **자연스러운 침묵** | "0회 발화"가 허용되므로, 디자이너에게 무관한 질문에 억지로 답하지 않을 수 있음 |
| **워크플로 단순화** | 라운드가 2개로 고정이라 n8n 그래프가 선형으로 유지됨 |

**지불하는 대가**

- 3턴 이상의 심화 토론이 불가능합니다. "A가 반박하고 B가 재반박하는" 흐름은 사용자가 다시 입력해야만 이어집니다
- 대화의 깊이를 모델이 아니라 **구조가 제한**합니다

학부 졸업작품의 자원 제약(16GB 단일 머신, 3분 응답)을 고려하면 타당한 선택입니다. 무한 루프 방지를 위한 정교한 종료 조건을 설계하는 대신, **구조 자체로 종료를 보장**했습니다.

---

## 4. 에이전트 구성 요약

| | 오케스트레이터 | 역할 에이전트 (3종) |
| --- | --- | --- |
| **모델** | OpenAI | Ollama (Qwen / Llama / Mistral 7~8B + LoRA) |
| **위치** | 클라우드 | 홈서버 on-premise |
| **역할** | 턴 판단 (누가/언제/할지말지) | 실제 응답 생성 |
| **출력 형식** | 구조화 JSON (Structured Output Parser) | 자유 텍스트 |
| **메모리** | Postgres Chat Memory (공유) | Postgres Chat Memory (공유) |
| **호출 횟수** | 턴당 1회 | 턴당 0~1회씩, 최대 2회 |

**역할별 모델 매핑** (n8n 노드 기준)

| 역할 | 1라운드 노드 | 2라운드 노드 |
| --- | --- | --- |
| 기획자 | `AI Agent-planner` ← `Ollama Chat Model10` | `AI Agent-planner3` ← `Ollama Chat Model12` |
| 디자이너 | `AI Agent-designer` ← `Ollama Chat Model9` | `AI Agent-designer3` ← `Ollama Chat Model11` |
| 개발자 | `AI Agent-developer` ← `Ollama Chat Model8` | `AI Agent-developer3` ← `Ollama Chat Model1` |

각 에이전트의 페르소나(성격·관심사)는 프론트엔드 `RoleConfig`에 정의된 것과 대응합니다 ([01. 개요](01-overview.md#5-페르소나-직군-에이전트) 참고). 이 성격 정의가 곧 n8n 에이전트 노드의 시스템 프롬프트 설계 근거입니다.

---

## 5. 데이터 저장 위치

워크플로가 건드리는 테이블은 2개입니다.

| 테이블 | 쓰는 노드 | 용도 |
| --- | --- | --- |
| `conversations` | `Create a row-user content`<br>`Create a row agent content3`<br>`Create a row agent content` | 사용자·에이전트 발화 저장. 응답 조립 시 다시 읽음 |
| `n8n_chat_histories` | `Postgres Chat Memory1` (자동) | n8n Memory 노드가 관리하는 대화 히스토리 |

**두 테이블은 목적이 다릅니다.**

- `conversations` — **애플리케이션이 소유**하는 대화 로그. 스키마를 우리가 정의하고, 화면 표시와 응답 조립에 사용
- `n8n_chat_histories` — **n8n Memory 노드가 소유**하는 저장소. 스키마를 n8n이 정의하고(`session_id: varchar`, `message: jsonb`), LLM 컨텍스트 주입에만 사용

같은 대화가 두 테이블에 이중으로 저장되는 셈이지만, 각각 다른 계층의 요구를 만족시킵니다. 스키마 상세는 [06. 데이터 모델](06-data-model.md)을 참고하십시오.

---

## 6. n8n을 선택한 결과 — 잘된 점과 한계

### 잘된 점

| | |
| --- | --- |
| **구현 속도** | GUI로 에이전트 흐름을 며칠 만에 구성. AutoGen이었다면 학습에만 그 시간이 들었을 것 |
| **시각적 검증** | 어느 노드에서 데이터가 어떻게 흐르는지 눈으로 확인. 팀원 간 설명도 스크린샷 하나로 끝남 |
| **연동 비용 0** | Ollama·Postgres·Webhook 모두 내장 노드. 어댑터를 직접 짤 필요가 없었음 |
| **셀프호스팅** | 홈서버 구성에 필수 조건이었고 n8n이 충족 |
| **요구사항과의 적합성** | 에이전트 3종 고정, 라운드 2회 고정 → 복잡한 상태 관리가 애초에 불필요했음 |

### 한계

| | |
| --- | --- |
| **노드 중복** | 라운드마다 동일 구조를 복제. 에이전트 3종 × 2라운드 = 6개 노드 + Ollama 노드 6개. 프롬프트 수정 시 여러 곳을 고쳐야 함 |
| **버전 관리 불가** | 워크플로가 n8n 인스턴스 안에 있어 git diff가 안 됨. 이 문서가 스크린샷 기반인 이유 |
| **상태 관리 표현력** | 조건부 반복, 동적 에이전트 수, 복잡한 종료 조건 등을 표현하기 어려움 |
| **테스트 불가** | 워크플로 단위 테스트를 작성할 방법이 마땅치 않음 |

### 다시 만든다면

라운드 수를 동적으로 하거나 에이전트를 3개 이상으로 확장하려면 **코드 기반 오케스트레이션이 필요**합니다. LangGraph처럼 그래프를 코드로 정의하는 프레임워크라면 노드 중복 없이 재귀적 구조를 표현할 수 있고, 버전 관리와 테스트도 가능합니다.

다만 이 프로젝트의 제약(기간·팀 숙련도·자원) 안에서는 n8n이 **완성을 보장한 선택**이었습니다. 프로덕션 규모가 아니라 개념 검증이 목표였고, 그 목표는 달성했습니다.

---

## 7. 이 워크플로에서 배운 것

**멀티에이전트 시스템의 난이도는 모델이 아니라 제어에 있습니다.**

각 에이전트가 좋은 답을 내는 것보다, *누가 언제 말할지*를 정하는 게 훨씬 어렵습니다. TeamTalk은 이 문제를 두 가지로 나눠 풀었습니다.

1. **판단은 모델에게** — 맥락을 봐야 하는 "누가 답해야 하는가"는 오케스트레이터 모델이
2. **실행은 구조로** — 무한 루프 같은 실패는 "각 에이전트 최대 1회"라는 하드 제약으로

정교한 알고리즘 대신 **단순하지만 확실한 제약**을 택한 것이 이 워크플로의 핵심 판단입니다.

---

| ← | → |
| --- | --- |
| [04. 백엔드 (TTS)](04-backend.md) | [06. 데이터 모델](06-data-model.md) |
