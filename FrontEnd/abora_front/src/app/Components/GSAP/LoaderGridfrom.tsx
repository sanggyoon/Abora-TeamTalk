'use client';
import React, { useEffect } from 'react';
import gsap from 'gsap';
import styles from './LoaderGridfrom.module.css';

export default function LoaderGridfrom() {
    useEffect(() => {
        const blocks = gsap.utils.toArray<HTMLElement>(`.${styles.block}`);
        gsap.set(blocks, { autoAlpha: 0 }); // 초기 숨김

        gsap.to(blocks, {
            autoAlpha: 1, // 즉시 등장처럼
            duration: 0.4,
            stagger: {
                each: 0.015,
                from: 'random',
            },
        });
    }, []);

    return (
        <div className={styles.loaderWrapper}>
            {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className={styles.block} />
            ))}
        </div>
    );
}
