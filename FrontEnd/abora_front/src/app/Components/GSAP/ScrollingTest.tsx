'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './BackgroundText.module.css';

export default function ScrollingText() {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.to(scrollRef.current, {
            xPercent: -50,
            duration: 21,
            ease: 'linear',
            repeat: -1,
        });
    }, []);

    return (
        <div className={styles.wrapper}>
            <div ref={scrollRef} className={styles.scrollingText}>
                <span>ECHO ECHO ECHO ECHO ECHO ECHO ECHO ECHO </span>
                <span>ECHO ECHO ECHO ECHO ECHO ECHO ECHO ECHO </span>
            </div>
        </div>
    );
}
