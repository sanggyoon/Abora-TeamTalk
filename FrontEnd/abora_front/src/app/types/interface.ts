import {ChatRole} from "@/app/types/enum";

export interface Message {
    type: ChatRole;
    message: string;
    time?: string;
}
