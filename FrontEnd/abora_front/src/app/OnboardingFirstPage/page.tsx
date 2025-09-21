"use client";

import roles from "@/data/role.json";
import WhiteBlock from "@/app/Components/WhiteBloack/WhiteBlock";
import style from "./page.module.css"
import TitleTextBlock from "@/app/Components/TitleTextBlack/TitleTextBlock";
// import style1 from "@/app/Components/TitleTextBlack/TitleTextBlock.module.css";
import {useRouter} from "next/navigation";
// import {white} from "next/dist/lib/picocolors";
import {useState} from "react";
import common from "@/app/Components/common/common.module.css"

export default function OnboardingFirstPage() {
    const router = useRouter();
    const [activeList, setActiveList] = useState([false, false, false, false]);

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
            <h3 className={style.headerText}>당신은 어떤 사람인가요?</h3>
            <div className={common.container}>
                <h3 className={style.headerText}>당신은 직군을 선택하세요</h3>
                <div className={style.roleSection}>
                    {
                        roles.map((role, idx)=>(
                            <WhiteBlock
                                as="button"
                                key={idx}
                                imageSrc={role.imageSrc}
                                onClick={() => toggle(idx)}
                                title={role.title}
                                style={{ border: `2px solid ${activeList[idx] ? "var(--select-color)" : "white"}` }}
                            />
                        ))
                    }
                </div>
            </div>

            {/*이름입력*/}
            <div className={style.textCenter}>
                <TitleTextBlock text={"이름"}/>
                <div>
                    <TitleTextBlock backgroundColor={"white"}>
                        <input type={"text"} className={style.inputStyle} style={{border:"1px solid white"}}/>
                    </TitleTextBlock>
                </div>
            </div>

            {/*다음페이지로 ->버튼*/}
            <div className={style.textCenter}>
                <TitleTextBlock>
                    <button onClick={handleButtonClick} style={{backgroundColor : "black", border:"none"}}>
                        <p style={{color: "white"}}>시나리오 선택하기</p>
                    </button>
                </TitleTextBlock>
                <p className={style.buttonDesc}>어떤 상황을 연습해볼까요? 시나리오를 만들어볼까요?</p>
            </div>
        </div>
    );
}