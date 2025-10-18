import { ChatRole } from "@/app/types/enum";
import { LipSyncData } from "@/app/types/interface";
import React from "react";

export function setLipSyncState(
    type: ChatRole,
    json: string,
    filename: string,
    setLipSyncA: React.Dispatch<React.SetStateAction<LipSyncData | null>>,
    setLipSyncB: React.Dispatch<React.SetStateAction<LipSyncData | null>>
): void {
    const lipSyncData: LipSyncData = { json, mp3: filename };
    
    if (type === ChatRole.AgentA) {
        setLipSyncA(lipSyncData);
    } else if (type === ChatRole.AgentB) {
        setLipSyncB(lipSyncData);
    }
}
