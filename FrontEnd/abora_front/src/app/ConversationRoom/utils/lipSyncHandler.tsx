import { Message } from "../../types/interface";



export function setLipSyncState(
    type: Message["type"],
    json: any,
    mp3: string,
    setLipSyncA: (data: any) => void,
    setLipSyncB: (data: any) => void
) {
    const setLipSync = type === "agentA" ? setLipSyncA : setLipSyncB;
    setLipSync({ json, mp3 });
}
