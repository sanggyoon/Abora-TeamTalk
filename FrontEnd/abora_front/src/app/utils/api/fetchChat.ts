import { Chat } from "@/app/types/interface"; // content 타입용
import { ChatSession } from "@/app/types/interface"; // 세션 타입용

export async function sendChatMessage( content : string) {
    // 1 localStorage에서 세션 데이터 불러오기
    const savedSession = localStorage.getItem("chatSession");
    if (!savedSession) {
        throw new Error("세션 정보가 없습니다. 먼저 세션을 생성하세요.");
    }

    const session: ChatSession = JSON.parse(savedSession);

    //  2 메시지 구성
    const body: Chat = {
        session_id: session.session_id,
        sender_role: session.sender_role,
        is_user: true,
        content: content,
        worker1_role: session.worker1_role,
        worker2_role: session.worker2_role,
    };

    console.log("📤 전송할 데이터:", JSON.stringify(body, null, 2));
    console.log("📡 API URL:", `${process.env.NEXT_PUBLIC_API_URL}/webhook/expert-models`);

    // 3 API 전송
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/webhook/expert-models`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        console.log("응답 상태:", res.status);
        console.log("응답 헤더:", Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
            const errorText = await res.text();
            console.error("에러 응답:", errorText);
            throw new Error(`메시지 전송 실패: ${res.status} - ${errorText}`);
        }

        //4 응답 반환(응답 받은 text)
        const text = await res.text();
        console.log("📥 응답 텍스트:", text);

        if (!text) {
            throw new Error("응답이 비어있습니다.");
        }

        try {
            const parsed = JSON.parse(text);
            console.log("✅ 파싱된 데이터:", parsed);
            return parsed;
        } catch (parseError) {
            console.error("❌ JSON 파싱 실패:", parseError);
            throw new Error(`JSON 파싱 실패: ${text}`);
        }

    } catch (fetchError) {
        console.error("❌ Fetch 에러:", fetchError);
        throw fetchError;
    }

}
