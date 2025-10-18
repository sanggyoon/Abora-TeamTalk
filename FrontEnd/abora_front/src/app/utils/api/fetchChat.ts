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
    };

    // 3 API 전송
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/webhook/expert-models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    console.log("res data 답변 :",res);

    if (!res.ok) {
        throw new Error(`메시지 전송 실패: ${res.status}`);
    }

    // console.log("content 길이:", res.content?.length);
    // console.log("content 내용:", JSON.stringify(res.content));
    console.log(res.status);
    console.log("res의 body :", res.body);
    console.log(Object.fromEntries(res.headers.entries()))

    //4 응답 반환(응답 받은 text)
    const text = await res.text();
    console.log(text);


    if (!text) return null; // 혹은 return null;
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text }; // 혹은 throw new Error("JSON 파싱 실패");
    }

}
