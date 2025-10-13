'use client';

// import WhiteBlock from "@/app/Components/WhiteBloack/WhiteBlock";
import style from './page.module.css';
import TitleTextBlock from '@/app/Components/ui/TitleTextBlack/TitleTextBlock';
import { useRouter, useSearchParams } from 'next/navigation';
import SenarioBlock from '@/app/Components/SenarioBlock/SenarioBlock';
import { useState } from 'react';
import scenarios from '@/data/senario.json';
import common from '@/app/Components/common/common.module.css';
import AvatarBlock from '@/app/Components/feature/AvatarBlock/AvatarBlock';
import { Role } from '@/app/types/enum';
import { RoleConfig } from '@/app/config/RoleConfig';
import { supabase } from '@/lib/supabase';
import roleToKorean from '@/app/config/mapKorean';

export default function OnboardingSecondPage() {
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = params?.get('role') as Role;

  const roleData = RoleConfig[roleParam];

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<
    number | null
  >(null);

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);

    // localStorage에 선택된 시나리오 저장
    const selectedScenario = scenarios[index];
    localStorage.setItem('selectedScenario', JSON.stringify(selectedScenario));
  };

  // const personaToggle = (index: number) => {
  //     setPersonaList((prev) =>
  //         prev.map((item, i) => (i === index ? !item : item))
  //     );
  // };

  // const handleSelectRole = (role:Role,idx:number)=>{
  //     activeToggle(idx);
  // }

  //roleParam의 filter로 나머지 role 값을 각각 agentA,B에 저장하기
  const handleButtonClick = async () => {
    // 1. 시나리오 선택 확인
    if (selectedScenarioIndex === null) {
      alert('시나리오를 선택해주세요!');
      return;
    }

    try {
      // 2. 현재 로그인한 사용자 정보 가져오기
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert('로그인 정보를 확인할 수 없습니다.');
        router.push('/login');
        return;
      }

      // 3. users 테이블에서 user_id 조회
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_email', user.email)
        .single();

      if (userError || !userData) {
        alert('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const userId = userData.id;

      // 4. Role을 한글로 변환하는 함수
      const roleToKorean = (role: Role): string => {
        const roleMap: Record<Role, string> = {
          [Role.Developer]: '개발자',
          [Role.Planner]: '기획자',
          [Role.Designer]: '디자이너',
        };
        return roleMap[role];
      };

      // 5. agent 역할 결정 (사용자 역할 제외한 나머지 2개)
      const otherRoles = Object.values(Role).filter(
        (role) => role !== roleParam
      );
      const agentA = otherRoles[0];
      const agentB = otherRoles[1];

      // 6. 선택된 시나리오 정보 가져오기
      const selectedScenario = scenarios[selectedScenarioIndex];
      const scenarioType = `시나리오${selectedScenarioIndex + 1}`;

      // 7. sessions 테이블에 INSERT (한글로 변환)
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          user_role: roleToKorean(roleParam),
          worker1_role: roleToKorean(agentA),
          worker2_role: roleToKorean(agentB),
          scenario_type: scenarioType, // '시나리오1', '시나리오2', '시나리오3'
          session_description: selectedScenario.description,
        })
        .select('id')
        .single();

      if (sessionError || !sessionData) {
        console.error('Session creation error:', sessionError);
        alert('채팅방 생성에 실패했습니다.');
        return;
      }

      const sessionId = sessionData.id;

      // 7. localStorage에 session_id 저장
      localStorage.setItem('session_id', sessionId.toString());

      // 추가: 세션 정보도 함께 저장 (기존 코드 호환성)
      const chatSessionData = {
        session_id: sessionId,
        sender_role: roleToKorean(roleParam),
        is_user: true,
      };
      localStorage.setItem('chatSession', JSON.stringify(chatSessionData));

      // 8. 대화방으로 이동
      router.push(`/ConversationRoom?agentA=${agentA}&agentB=${agentB}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className={common.container}>
      <div className={common.scrollLayer}>
        <h3 className={style.headerText}>오늘은 어떤 상황을 연습해볼까요?</h3>
        <div className={style.container}>
          <h3 className={style.headerText}>시나리오를 선택하기</h3>
          <div className={style.roleSection}>
            {scenarios.map((s, idx) => (
              <SenarioBlock
                key={idx}
                as="button"
                title={s.title}
                level={s.level}
                imageSrc={s.imageSrc}
                description={s.description}
                goal={s.goal}
                points={s.points}
                onClick={() => handleSelectScenario(idx)}
                inlineStyle={{
                  border: `2px solid ${
                    selectedScenarioIndex === idx
                      ? 'var(--select-color)'
                      : 'white'
                  }`,
                }}
              />
            ))}
          </div>
        </div>
        <div className={style.container}>
          <h3 className={style.headerText}>
            {roleData.role}인 당신과 함께할 동료를 소개합니다.
          </h3>
          <div className={style.roleSection}>
            {Object.values(Role)
              .filter((role) => roleParam != role)
              .map((role) => {
                return (
                  <AvatarBlock
                    as="div"
                    key={role}
                    role={role}
                    style={{ border: `2px solid white` }}
                  />
                );
                // }onClick={() => personaToggle(idx)} style={{ border: `2px solid ${personaList[idx] ? "var(--select-color)" : "white"}` }}
              })}
          </div>
        </div>

        <div className={style.textCenter}>
          <TitleTextBlock>
            <button
              onClick={handleButtonClick}
              style={{ backgroundColor: 'black', border: 'none' }}
            >
              <p style={{ color: 'white' }}>인사하러 가기</p>
            </button>
          </TitleTextBlock>
          <p className={style.buttonDesc}>
            준비가 완료 되었네요! 함께할 동료에게 인사하러 가볼까요?
          </p>
        </div>
      </div>
    </div>
  );
}
