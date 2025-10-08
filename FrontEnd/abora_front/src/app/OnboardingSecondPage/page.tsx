"use client";

// import WhiteBlock from "@/app/Components/WhiteBloack/WhiteBlock";
import style from "./page.module.css"
import TitleTextBlock from "@/app/Components/ui/TitleTextBlack/TitleTextBlock";
import {useRouter} from "next/navigation";
import SenarioBlock from "@/app/Components/SenarioBlock/SenarioBlock";
import {useState} from "react";
import scenarios from "@/data/senario.json"
import common from "@/app/Components/common/common.module.css"
import AvatarBlock from "@/app/Components/feature/AvatarBlock/AvatarBlock";
import {Role} from "@/app/types/enum";


export default function OnboardingSecondPage() {
    const router = useRouter();
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


    const handleButtonClick = () => {
        setTimeout(() => {
            router.push('/ConversationRoom');
        }, 1000); // 애니메이션 지속시간과 맞추기
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
                    <h3 className={style.headerText}>함께할 동료는 누구인가요?</h3>
                    <div className={style.roleSection}>
                        {/*여기서 현재 선택한 role빼고 role 반환*/}
                        {
                            Object.values(Role).filter((role)=>localStorage.getItem("role")!=role).map((role)=>{
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