"use client";

// import WhiteBlock from "@/app/Components/WhiteBloack/WhiteBlock";
import style from "./page.module.css"
import TitleTextBlock from "@/app/Components/ui/TitleTextBlack/TitleTextBlock";
import {useRouter, useSearchParams} from "next/navigation";
import SenarioBlock from "@/app/Components/SenarioBlock/SenarioBlock";
import {useState} from "react";
import scenarios from "@/data/senario.json"
import common from "@/app/Components/common/common.module.css"
import AvatarBlock from "@/app/Components/feature/AvatarBlock/AvatarBlock";
import {Role} from "@/app/types/enum";
import {RoleConfig} from "@/app/config/RoleConfig";



export default function OnboardingSecondPage() {
    const router = useRouter();
    const params = useSearchParams();
    const roleParam = params?.get("role") as Role;

    const roleData = RoleConfig[roleParam];

    const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number | null>(null);

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
    const handleButtonClick = () => {
        // 1. 현재 선택된 role을 제외하고 나머지 역할 2개 구하기
        const otherRoles = Object.values(Role).filter((role) => role !== roleParam);
        const agentA = otherRoles[0];
        const agentB = otherRoles[1];

        // 2. 1~999 랜덤 session_id 생성
        // const sessionId = Math.floor(Math.random() * 999) + 1;
        const sessionId_ad = 999;

        // 3. 로컬스토리지에 세션 정보 저장
        const sessionData = {
            session_id: sessionId_ad,
            sender_role: roleParam, // 현재 사용자 역할
            is_user: true,
        };
        localStorage.setItem("chatSession", JSON.stringify(sessionData));

        // 4️. 대화방으로 이동 (agent 정보 전달)
        router.push(`/ConversationRoom?agentA=${agentA}&agentB=${agentB}`);
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
                                inlineStyle={{border: `2px solid ${selectedScenarioIndex === idx ? "var(--select-color)" : "white"}`}}
                            />
                        ))}
                    </div>
                </div>
                <div className={style.container}>
                    <h3 className={style.headerText}>{roleData.role}인 당신과 함께할 동료를 소개합니다.</h3>
                    <div className={style.roleSection}>
                        {
                            Object.values(Role).filter((role)=>roleParam!=role).map((role)=>{
                                return <AvatarBlock as="div" key={role} role={role} style={{border:`2px solid white`}}/>;
                                // }onClick={() => personaToggle(idx)} style={{ border: `2px solid ${personaList[idx] ? "var(--select-color)" : "white"}` }}
                            })
                        }
                    </div>
                </div>


                <div className={style.textCenter}>
                    <TitleTextBlock>
                        <button onClick={handleButtonClick} style={{backgroundColor: "black", border: "none"}}>
                            <p style={{color: "white"}}>인사하러 가기</p>
                        </button>
                    </TitleTextBlock>
                    <p className={style.buttonDesc}>준비가 완료 되었네요! 함께할 동료에게 인사하러 가볼까요?</p>
                </div>
            </div>
        </div>
            );
}