import styles from "./BadgeComponent.module.css"
import React from "react";
import Image from "next/image";

interface RoleBadgeProps{
    color : string;
    name : string;
    role : string;
    iconSrc : string;
}

//1. Badge 기본적인 컴포넌트
//2. json에서 역할별 설정 Config에서 받아오는 새 역할별 roleBadge컴포넌트 생성
//3. AvatarBlock에서 역할 별 roleBadge 컴포넌트를 가져오기

export default function BadgeComponent({color="black", name="defalut", role="defalut", iconSrc=""}:RoleBadgeProps){
    return (
        <div>
            <div className={styles.nameImg}>
                <Image src={iconSrc} alt={`${name} 아이콘`} className={styles.icon} width={30} height={30}/>
                <div className={styles.name} style={{color:color}}>
                    {name}
                </div>
            </div>
            <span className={styles.role}>
                {role}
            </span>
        </div>
    );
}