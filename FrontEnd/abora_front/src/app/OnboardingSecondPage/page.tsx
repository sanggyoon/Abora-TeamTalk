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

    const [activeList, setActiveList] = useState([false, false, false]);
    // const [personaList, setPersonaList] = useState([false, false, false]);

    const activeToggle = (index: number) => {
        setActiveList((prev) =>
            prev.map((item, i) => (i === index ? !item : item))
        );
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
        const otherRoles = Object.values(Role).filter((role) => role !== roleParam);
        const agentA = otherRoles[0];
        const agentB = otherRoles[1];
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
                                onClick={() => activeToggle(idx)}
                                inlineStyle={{border: `2px solid ${activeList[idx] ? "var(--select-color)" : "white"}`}}

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