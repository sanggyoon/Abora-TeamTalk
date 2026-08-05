<p align="center">
  <img src="docs/img/teamtalk-icon.png" width="120" alt="TeamTalk" />
</p>

<h1 align="center">TeamTalk</h1>

<p align="center">
  역할별로 파인튜닝된 소형 LLM들이 <b>서로 협업해</b> 답하는 멀티에이전트 대화 서비스<br/>
  <sub>2025 종합설계(졸업작품) · 팀 ABORA · 🏆 최우수상 · 논문 1편</sub>
</p>

---

## 30초 요약

범용 대형 LLM을 한 번 호출하는 대신, **개발자·디자이너·기획자 역할로 파인튜닝한 소형 모델들을 협업**시켜 더 적은 비용으로 다각적인 답을 만드는 멀티에이전트 서비스입니다.

사용자가 역할 에이전트 2개를 고르면, **오케스트레이터 에이전트가 "누가·언제·답할지 말지"를 판단**해 토론하듯 답을 생성합니다. 생성된 답변은 TTS와 3D 아바타 립싱크를 거쳐, 두 동료가 실제로 대화하는 것처럼 화면에 재생됩니다.

<p align="center">
  <img src="docs/img/teamtalk-screenshot.png" width="700" alt="ConversationRoom 화면" />
</p>

---

## 팩트 시트

| 항목 | 내용 |
| --- | --- |
| 기간 | 2025.01 ~ 2025.12 (종합설계 / 졸업작품) |
| 팀 | **ABORA** (4명) |
| 결과 | 🏆 **최우수상** · 논문 1편 (공저자 등재) |
| 서비스 흐름 | 사용자 입력 → n8n 오케스트레이션 → Ollama 역할 에이전트 → Supabase 저장 → 3D 아바타 + TTS 재생 |
| 프론트엔드 | Next.js 15 (App Router) · React 19 · TypeScript · Three.js / React Three Fiber · GSAP |
| 오케스트레이션 | **n8n** (셀프호스팅) — 웹훅 수신, 에이전트 턴 제어, DB 저장 |
| 추론 | **Ollama** (on-premise) — Qwen / Llama / Mistral 7~8B + 역할별 **LoRA** |
| 데이터 | **셀프호스팅 Supabase** (내부 PostgreSQL) |
| 음성 | FastAPI + Google Cloud TTS + **faster-whisper** (립싱크 타이밍 추출) |
| 인프라 | **Mac mini M4 / 16GB** 홈서버 · DNS → **Nginx**(443/80) → FE/BE 라우팅 · Docker |

### 팀 구성 및 역할

| 이름 | 담당 |
| --- | --- |
| **김상균** | **팀장** · 인프라 · 백엔드 · n8n 오케스트레이션 · 전체 데이터 플로우 설계 |
| 용채영 | 프론트엔드 |
| 김동년 | 백엔드 · ML (LoRA 파인튜닝) |
| 손정민 | 데이터베이스 |

---

## 리포지토리 히스토리

TeamTalk은 두 번의 버전을 거쳤습니다.

| 버전 | 리포지토리 | 시기 | 상태 |
| --- | --- | --- | --- |
| **v1** | [`202503-ABORA-multi_agent_system_v1`](https://github.com/sanggyoon/202503-ABORA-multi_agent_system_v1) | 2025.03 ~ | 아이디어 검증 단계. 루트에 `project_ABORA/` 단일 구조, 244 커밋 |
| **v2** | [`202509-ABORA-multi_agent_system_v2`](https://github.com/sanggyoon/202509-ABORA-multi_agent_system_v2) | 2025.09 ~ 2025.10 | **현재 리포지토리.** `FrontEnd/` + `BackEnd/` 분리 구조 |

> 이 문서는 **v2 코드베이스**를 기준으로 작성되었습니다. 로컬 리포지토리의 원격은 `Abora-TeamTalk`이며 v2와 동일한 코드베이스입니다.

### 명칭 정리

코드 곳곳에 세 가지 이름이 섞여 있습니다. 문서 전체에서는 **TeamTalk**으로 통일합니다.

| 이름 | 어디에 쓰이나 |
| --- | --- |
| **TeamTalk** | 프로젝트 정식 명칭 (문서 기준) |
| Abora | 팀 이름. 프론트엔드 폴더명 `abora_front`, IDE 모듈명 `Abora-TeamTalk` |
| Tatak | 랜딩 페이지 UI 카피에 노출되는 서비스명 (`Hello, Tatak!`) |

---

## 문서 인덱스

| 문서 | 다루는 내용 |
| --- | --- |
| [01. 프로젝트 개요](docs/01-overview.md) | 기획 배경, 방향 전환(피벗) 과정, 타깃, 시나리오·페르소나, 화면 흐름 |
| [02. 시스템 아키텍처](docs/02-architecture.md) | 컴포넌트 구성, 요청 흐름, 인프라, **기술 선택 근거와 트레이드오프** |
| [03. 프론트엔드](docs/03-frontend.md) | Next.js 라우트 구조, 상태 흐름, **3D 아바타 립싱크 파이프라인** |
| [04. 백엔드 (TTS)](docs/04-backend.md) | FastAPI TTS 서비스, Whisper 타이밍 추출, API 스펙 |
| [05. n8n 워크플로](docs/05-n8n-workflow.md) | 멀티에이전트 오케스트레이션, 턴 제어, 종료 보장, CORS 분기 |
| [06. 데이터 모델](docs/06-data-model.md) | Supabase 스키마, 테이블 관계, role 표기 컨벤션 |
| [07. 실행 및 배포](docs/07-setup.md) | 로컬 실행 절차, 환경 변수, 운영 당시 배포 구성 |
| [08. 알려진 이슈](docs/08-known-issues.md) | 미완성 지점, 성능·보안 한계, 개선 로드맵 |

---

## 문서 작성 원칙

이 문서는 **코드에서 직접 확인한 사실**과 **설계 의도로 진술된 내용**을 구분해 서술합니다.

- 코드에 근거가 있는 서술은 파일 경로를 함께 표기합니다 (예: `src/app/config/RoleConfig.ts`)
- 코드에 남아있지 않은 내용(운영 당시 인프라, LoRA 학습, 모델 구성 등)은 **설계 의도** 또는 **운영 당시 구성**으로 명시합니다
- 현재 코드가 문서화된 설계와 다르게 동작하는 지점은 [08. 알려진 이슈](docs/08-known-issues.md)에 모두 정리했습니다

> 기존 문서인 `FrontEnd/PROJECT_TECH_STACK.md`와 `BackEnd/README.md`는 이 문서 세트와 별개로 유지됩니다. 두 문서에는 현재 코드와 일치하지 않는 서술이 일부 있으므로, 충돌 시 이 `docs/` 문서를 우선하십시오.
