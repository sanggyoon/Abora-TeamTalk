'use client';
import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import styles from './LoaderGridto.module.css';

export default function LoaderGridto() {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const blocks = document.querySelectorAll(`.${styles.block}`);
        gsap.to(blocks, {

            opacity: 0,
            duration: 0,
            stagger: {
                each: 0.015,   // 개별 블록 사라지는 간격
                from: 'random' // ⬅️ 랜덤 순서로 사라짐!
            },
            onComplete: () => setHidden(true),
        });
    }, []);

    if (hidden) return null;

    return (
        <div className={styles.loaderWrapper}>
            {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className={styles.block} />
            ))}
        </div>
    );
}
