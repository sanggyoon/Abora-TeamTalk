"use client";
import { useEffect, useState } from "react";
import { Role} from "@/app/types/enum";
import {ChatSession} from "@/app/types/interface";

//Session 생성
export function useChatSession() {
    const [session, setSession] = useState<ChatSession | null>(null);

    // 페이지 로드 시 localStorage에서 복원
    useEffect(() => {
        const savedSession = localStorage.getItem("chatSession");
        if (savedSession) {
            const parsed: ChatSession = JSON.parse(savedSession);
            setSession(parsed);
        }
    }, []);

    // 새로운 세션 생성 및 저장
    const createSession = (id: number, role: Role, room_name: string, worker1_role: Role, worker2_role: Role) => {
        const newSession: ChatSession = {
            session_id: id,
            sender_role: role,
            is_user: true,
            room_name: room_name,
            worker1_role: worker1_role,
            worker2_role: worker2_role
        };
        localStorage.setItem("chatSession", JSON.stringify(newSession));
        setSession(newSession);
    };

    return {
        sessionId: session?.session_id ?? null,
        senderRole: session?.sender_role ?? null,
        isUser: session?.is_user ?? true,
        createSession,
    };
}
