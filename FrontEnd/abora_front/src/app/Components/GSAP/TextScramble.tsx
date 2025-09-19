'use client';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

interface HoverScrambleProps {
    from: string;
    to: string;
    className?: string;
}

export default function HoverScramble({ from, to, className }: HoverScrambleProps) {
    const textRef = useRef<HTMLSpanElement>(null);
    const currentTween = useRef<gsap.core.Tween | null>(null); // 현재 실행 중인 트윈 저장

    useEffect(() => {
        if (textRef.current) {
            textRef.current.textContent = from;
        }
    }, [from]);

    const scrambleTo = (targetText: string) => {
        if (!textRef.current) return;

        // 기존 트윈이 있으면 강제 중단
        if (currentTween.current) {
            currentTween.current.kill();
        }

        const tween = gsap.to(textRef.current, {
            duration: 1,
            scrambleText: {
                text: targetText,
                chars: "!<>-_\\/[]{}—=+*^?#",
                speed: 0.3,
                revealDelay: 0.2,
            },
        });

        currentTween.current = tween;
    };

    const handleMouseEnter = () => {
        scrambleTo(to);
    };

    const handleMouseLeave = () => {
        scrambleTo(from);
    };

    return (
        <span
            ref={textRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={className}
            style={{ display: 'inline-block' }}
        />
    );
}
