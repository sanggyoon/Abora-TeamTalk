import {ChatRole, Role} from "@/app/types/enum";

export interface Message {
    speaker: string;
    type: ChatRole;
    message: string;
    timestamp: string;
}

export interface LipSyncData{
    json: string;
    mp3: string;
}


//Chatting에서 api로 서버로 전송할 때 사용할 interface
export interface Chat{
    session_id : number, //방 Id : localStorage
    sender_role : Role,  //유저가 선택한 role : localStorage
    is_user : boolean, //로그인 여부 : 일단 고정

    content : string, //content 유저의 채팅
}

//한 session이 가지고 있어야할 기본적인 session-info
export interface ChatSession {
    session_id: number;
    sender_role: Role;
    is_user: boolean;

    room_name:string; //프론트만 가지고 있으면 됨.
}

//응답 받을 때 interface
export interface ResponseChatResponse {
    success: boolean;
    ai_role: string;
    content: string;
    session_id: string;
}

export interface ClientChatMessage {
    speaker: string;
    message: string;
    type: ChatRole;
    timestamp: string;
}