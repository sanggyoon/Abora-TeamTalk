import {useEffect} from "react";
import {LipSyncData, Message} from "../../types/interface";
import {fetchTTS} from "../utils/fetchTTS";
import {getVoiceByType} from "../utils/voiceSelector";
import {setLipSyncState} from "../utils/lipSyncHandler";
import {ChatRole} from "@/app/types/enum";

interface UseMessagePlayerProps {
    messagesToPlay: Message[];
    currentIndex: number;
    agentAData: { voice: string };
    agentBData: { voice: string };
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setIsSpeakingA: (v: boolean) => void;
    setIsSpeakingB: (v: boolean) => void;
    setLipSyncA: React.Dispatch<React.SetStateAction<LipSyncData | null>>;
    setLipSyncB: React.Dispatch<React.SetStateAction<LipSyncData | null>>;
}

export function useMessagePlayer({
                                     messagesToPlay,
                                     currentIndex,
                                     agentAData,
                                     agentBData,
                                     setMessages,
                                     setIsSpeakingA,
                                     setIsSpeakingB,
                                     setLipSyncA,
                                     setLipSyncB,
                                 }: UseMessagePlayerProps) {
    useEffect(() => {
        const play = async () => {
            const msg = messagesToPlay[currentIndex];
            if (!msg) return;

            setMessages((prev) => [...prev, msg]);

            const voice = getVoiceByType(msg.type, agentAData, agentBData);

            if (msg.type === ChatRole.AgentA) setIsSpeakingA(true);
            else if (msg.type === ChatRole.AgentB) setIsSpeakingB(true);

            try {
                const { json, filename } = await fetchTTS(msg.message, voice);
                setLipSyncState(msg.type, json, filename, setLipSyncA, setLipSyncB);
            } catch (error) {
                console.error("TTS fetch error:", error);
            } finally {
                setIsSpeakingA(false);
                setIsSpeakingB(false);
            }
        };

        if (currentIndex >= 0) play();
    }, [currentIndex]);
}
