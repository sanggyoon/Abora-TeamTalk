"use client";

// import WhiteBlock from "@/app/Components/WhiteBloack/WhiteBlock";
import style from "./page.module.css"
import TitleTextBlock from "@/app/Components/TitleTextBlack/TitleTextBlock";
import {useRouter} from "next/navigation";
import SenarioBlock from "@/app/Components/SenarioBlock/SenarioBlock";
import {useState} from "react";
import scenarios from "@/data/senario.json"
import common from "@/app/Components/common/common.module.css"

export default function OnboardingFirstPage() {
    const router = useRouter();
    const [activeList, setActiveList] = useState([false, false, false]);

    const toggle = (index: number) => {
        setActiveList((prev) =>
            prev.map((item, i) => (i === index ? !item : item))
        );
    };


    const handleButtonClick = () => {
        setTimeout(() => {
            router.push('/OnboardingSecondPage');
        }, 1000); // 애니메이션 지속시간과 맞추기
    };

    return (
        <div className={common.container}>
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
                            onClick={() => toggle(idx)}
                            inlineStyle={{ border: `2px solid ${activeList[idx] ? "var(--select-color)" : "white"}`}}

                        />
                    ))}
                </div>
            </div>


            {/*다음페이지로 ->버튼*/}
            <div className={style.textCenter}>
                <TitleTextBlock>
                    <button onClick={handleButtonClick} style={{backgroundColor : "black", border:"none"}}>
                        <p style={{color: "white"}}>인사하러 가기</p>
                    </button>
                </TitleTextBlock>
                <p className={style.buttonDesc}>준비가 완료 되었네요! 함께할 동료에게 인사하러 가볼까요?</p>
            </div>
        </div>
    );
}