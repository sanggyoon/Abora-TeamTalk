"use client";

import WhiteBlock from "@/app/Components/WhiteBloack/WhiteBlock";
import style from "./page.module.css"
import TitleTextBlock from "@/app/Components/TitleTextBlack/TitleTextBlock";
import style1 from "@/app/Components/TitleTextBlack/TitleTextBlock.module.css";
import {useRouter} from "next/navigation";
import {white} from "next/dist/lib/picocolors";

export default function OnboardingFirstPage() {
    const router = useRouter();

    const handleButtonClick = () => {
        setTimeout(() => {
            router.push('/OnboardingSecondPage');
        }, 1000); // 애니메이션 지속시간과 맞추기
    };

    return (
        <>
            <h3 className={style.headerText}>당신은 어떤 사람인가요?</h3>
            <section>
                <h3 className={style.headerText}>당신은 직군을 선택하세요</h3>
                <div className={style.roleSection}>
                    <WhiteBlock
                        imageSrc="/iconImage/roleicon1.png"
                        title="개발자"
                    />
                    <WhiteBlock
                        imageSrc="/iconImage/roleicon1.png"
                        title="개발자"
                    />
                    <WhiteBlock
                        imageSrc="/iconImage/roleicon1.png"
                        title="개발자"
                    />
                    <WhiteBlock
                        imageSrc="/iconImage/roleicon1.png"
                        title="개발자"
                    />
                </div>
            </section>

            {/*이름입력*/}
            <section>
                <TitleTextBlock text={"이름"}/>
            </section>

            {/*다음페이지로 ->버튼*/}
            <section>
                <button className={style1.textWrapper} onClick={handleButtonClick}>
                    <div style={{color:"white"}}>시나리오 선택하기</div>
                </button>
            </section>
        </>
    );
}