import { ChatRole } from "@/app/types/enum";

export function getVoiceByType(
    type: ChatRole,
    agentAData: { voice: string },
    agentBData: { voice: string }
) {
    if (type === ChatRole.AgentA) {
        return agentAData.voice;
    } else if (type === ChatRole.AgentB) {
        return agentBData.voice;
    }
    return agentAData.voice;
}
