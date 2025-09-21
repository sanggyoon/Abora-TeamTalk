'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import HoverScramble from './Components/GSAP/TextScramble';
import LoaderGridfrom from './Components/GSAP/LoaderGridfrom';
import SplitText from "@/app/Components/ReactBits/TextSplit";
import CircularText from "@/app/Components/ReactBits/CircularText";

export default function Home() {
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    const handleAnimationComplete = () => {
        console.log('All letters have animated!');
    };

    // ① 화면이 마운트된 이후임을 표시
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // ② 버튼 누르면 로더 띄우고 페이지 이동
    const handleButtonClick = () => {
        setShowLoader(true);
        setTimeout(() => {
            router.push('/OnboardingFirstPage');
        }, 1000); // 애니메이션 지속시간과 맞추기
    };

    return (
        <>
        <div className={styles.container}>
            <div className={styles.Maintitle}>
                <CircularText
                    text="THINK ✦ DEEPER ✦ QUESTION ✦ FURTHER ✦ THINK ✦ DEEPER ✦ QUESTION ✦ FURTHER ✦ TEAMTALK ✦ "
                    onHover="slowDown"
                    spinDuration={40}
                    className={styles.backgroundCircle}
                />
            </div>
            <div className={styles.foreground}>
                <SplitText
                    text="Hello, Tatak!"
                    className="text-2xl font-semibold text-center"
                    delay={100}
                    duration={0.6}
                    ease="power3.out"
                    splitType="chars"
                    from={{opacity: 0, y: 40}}
                    to={{opacity: 1, y: 0}}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="center"
                    onLetterAnimationComplete={handleAnimationComplete}
                />
                <h3 className={styles.subtitle}>생각을 더 묻고, 질문을 더 멀리.</h3>
                <p className={styles.text}>

                    Tatak은 단순한 Q&amp;A 도구가 아닙니다.<br/>
                    하나의 아이디어가 여러 시선 속에서 울림을 만들도록,<br/>
                    AI 아바타들과 함께 질문을 나누고,<br/>
                    다양한 관점으로 생각을 확장하는 대화형 아이디어 실험실입니다.<br/><br/>
                    그냥 당신의 아이디어에 <span className={styles.highlight}>한 줄만</span> 말해주세요.
                </p>
                <button className={styles.button} onClick={handleButtonClick}>
                    <HoverScramble from="ENTER" to="GO"/>
                </button>
            </div>
        </div>
</>
)
    ;
}
