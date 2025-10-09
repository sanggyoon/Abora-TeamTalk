import { Message } from "../../types/interface";

export function getVoiceByType(
    type: Message["type"],
    agentAData: { voice: string },
    agentBData: { voice: string }
) {
    switch (type) {
        case "agentA":
            return agentAData.voice;
        case "agentB":
            return agentBData.voice;
        default:
            return "default_voice";
    }
}
