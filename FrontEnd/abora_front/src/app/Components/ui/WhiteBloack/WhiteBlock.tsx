// src/components/WhiteBlock.tsx
"use client";

import Image from "next/image";
// import common from "@/app/Components/common/common.module.css"
import styles from "./WhiteBlock.module.css"
import {RoleConfig} from "@/app/config/RoleConfig";
import {Role} from "@/app/types/enum";

interface WhiteBlockProps {
    as? : "div" | "button";
    role : Role,
    onClick?: () => void,
    style?: React.CSSProperties,
}

export default function WhiteBlock({
                                       as : Tag = "div",
    role,
                                       onClick,style
                                   }: WhiteBlockProps) {
    const roleData = RoleConfig[role]
    return (
        <Tag className={styles.roleBackground} style={style} onClick={onClick}>
            <Image
                src={roleData.IconImageSrc}
                alt={roleData.role}
                width={100}
                height={100}
                style={{ borderRadius: "8px" }}
            />
            <h3 style={{ marginTop: "12px", fontSize: "1.2rem", fontWeight: "600",color:"black" }}>
                {roleData.role}
            </h3>
        </Tag>
    );
}
