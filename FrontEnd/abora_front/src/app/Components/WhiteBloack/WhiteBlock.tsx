// src/components/WhiteBlock.tsx
"use client";

import Image from "next/image";
import style from "./WhiteBlock.module.css"

interface WhiteBlockProps {
    imageSrc: string;      // 이미지 경로 (로컬 / 외부 URL)
    imageAlt?: string;     // 대체 텍스트
    title: string;         // 큰 제목
}

export default function WhiteBlock({
                                       imageSrc,
                                       imageAlt = "image",
                                       title,
                                   }: WhiteBlockProps) {
    return (
        <div className={style.background}>
            <Image
                src={imageSrc}
                alt={imageAlt}
                width={100}
                height={100}
                style={{ borderRadius: "8px" }}
            />
            <h3 style={{ marginTop: "12px", fontSize: "1.2rem", fontWeight: "600",color:"black" }}>
                {title}
            </h3>
        </div>
    );
}
