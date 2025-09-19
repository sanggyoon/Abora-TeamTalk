'use client';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

// 플러그인 등록
gsap.registerPlugin(TextPlugin);

interface TypingTextProps {
    text: string;
    delay?: number;
    className?: string; // 스타일 확장용
}

export default function TypingText({
                                       text,
                                       delay = 0,
                                       className = '',
                                   }: TypingTextProps) {
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (textRef.current) {
            const charSpeed = 0.08; // 한 글자당 0.1초
            const totalDuration = text.length * charSpeed;

            gsap.to(textRef.current, {
                duration: totalDuration,
                text,
                delay,
                ease: 'none',
            });
        }
    }, [text, delay]);

    return (
        <div
            ref={textRef}
            className={className}
        />
    );
}
