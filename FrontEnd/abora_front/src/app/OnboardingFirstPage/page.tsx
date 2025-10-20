"use client";

import style from "./page.module.css"
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import TitleTextBlock from "@/app/Components/ui/TitleTextBlack/TitleTextBlock";
import {useRouter} from "next/navigation";
import { useState } from "react";
import common from "@/app/Components/common/common.module.css"
import {Role} from "@/app/types/enum";
import WhiteBlock from "@/app/Components/ui/WhiteBloack/WhiteBlock";

export default function OnboardingFirstPage() {
    const router = useRouter();
    const [selectedRoleIndex, setSelectedRoleIndex] = useState<number | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    // 로그인 체크
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                router.push("/login");
            }
        };

        checkAuth();
    }, [router]);

    const handleSelectRole = (role: Role, idx: number) => {
        setSelectedRoleIndex(idx);
        setSelectedRole(role);
        
        // localStorage에 선택된 role 저장
        localStorage.setItem('selectedRole', role);
    }


    const handleButtonClick = () => {
        if(!selectedRole) return;
        setTimeout(() => {
            router.push(`/OnboardingSecondPage?role=${selectedRole}`);
        }, 1000); // 애니메이션 지속시간과 맞추기
    };

    return (
        <div className={common.container}>
            <h3 className={style.headerText}>당신은 어떤 사람인가요?</h3>
            <div className={common.container}>
                <h3 className={style.headerText}>당신은 직군을 선택하세요</h3>
                <div className={style.roleSection}>
                    {
                        Object.values(Role)
                            .filter(role => role !== Role.User) // User는 제외
                            .map((role, idx)=>{
                                return <WhiteBlock as="button" onClick={() => handleSelectRole(role,idx)} key={role} role={role} style={{ border: `2px solid ${selectedRoleIndex === idx ? "var(--select-color)" : "white"}` }}/>;
                            })
                    }
                </div>
            </div>

            {/*/!*이름입력*!/*/}
            {/*<div className={style.textCenter}>*/}
            {/*    <TitleTextBlock text={"방 이름"}/>*/}
            {/*    <div>*/}
            {/*        <TitleTextBlock backgroundColor={"white"}>*/}
            {/*            <input type={"text"} className={style.inputStyle} style={{border:"1px solid white"}}/>*/}
            {/*        </TitleTextBlock>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*다음페이지로 ->버튼*/}
            <div className={style.textCenter}>
                <TitleTextBlock>
                    <button onClick={()=>handleButtonClick()} style={{backgroundColor : "black", border:"none"}}>
                        <p style={{color: "white"}}>시나리오 선택하기</p>
                    </button>
                </TitleTextBlock>
                <p className={style.buttonDesc}>어떤 상황을 연습해볼까요? 시나리오를 만들어볼까요?</p>
            </div>
        </div>
    );
}