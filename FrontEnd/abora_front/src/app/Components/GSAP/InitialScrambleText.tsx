'use client';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// ScrambleText 플러그인 등록
gsap.registerPlugin(ScrambleTextPlugin);

interface InitialScrambleTextProps {
    to: string;             // 최종 표시할 텍스트
    duration?: number;      // 애니메이션 시간 (기본 1초)
    className?: string;     // 스타일 클래스
    delay?: number;         // 시작 지연 시간 (초)
    scrambleChars?: string; // 사용할 문자 세트
}

export default function InitialScrambleText({
                                                to,
                                                duration = 1.5,
                                                delay = 0,
                                                className = '',
                                                scrambleChars = "!<>-_\\/[]{}—=+*^?#",
                                            }: InitialScrambleTextProps) {
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (textRef.current) {
            gsap.to(textRef.current, {
                duration,
                delay,
                scrambleText: {
                    text: to,
                    chars: scrambleChars,
                    speed: 0.3,
                    revealDelay: 0.2,
                },
            });
        }
    }, [to, duration, delay, scrambleChars]);

    return (
        <span ref={textRef} className={className} style={{ display: 'inline-block' }} />
    );
}
