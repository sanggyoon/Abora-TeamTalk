// src/components/WhiteBlock.tsx
"use client";

import Image from "next/image";
// import common from "@/app/Components/common/common.module.css"
import styles from "./WhiteBlock.module.css"

interface WhiteBlockProps {
    as? : "div" | "button";
    onClick?: () => void,
    imageSrc: string;
    imageAlt?: string;
    title: string;
    style?: React.CSSProperties,
}

export default function WhiteBlock({
                                       as : Tag = "div",
                                       imageSrc,
                                       imageAlt = "image",
                                       title,
                                       onClick,style
                                   }: WhiteBlockProps) {
    return (
        <Tag className={styles.roleBackground} style={style} onClick={onClick}>
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
        </Tag>
    );
}
