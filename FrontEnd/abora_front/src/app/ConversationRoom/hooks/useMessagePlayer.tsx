import {useEffect} from "react";
import {LipSyncData, Message} from "../../types/interface";
// import {fetchTTS} from "../utils/fetchTTS"; // 임시 주석
// import {getVoiceByType} from "../utils/voiceSelector"; // 임시 주석
// import {setLipSyncState} from "../utils/lipSyncHandler"; // 임시 주석
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
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>; // 추가
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
                                     setCurrentIndex, // 추가
                                 }: UseMessagePlayerProps) {
    useEffect(() => {
        const play = async () => {
            const msg = messagesToPlay[currentIndex];
            if (!msg) return;

            // 메시지를 화면에 추가
            setMessages((prev) => [...prev, msg]);

            // TTS 임시 주석 처리 - 메시지만 표시하고 바로 다음으로 진행
            console.log(`메시지 ${currentIndex + 1}/${messagesToPlay.length} 표시됨:`, msg.message);

            // 다음 메시지가 있으면 1초 후 자동 진행
            if (currentIndex + 1 < messagesToPlay.length) {
                setTimeout(() => {
                    setCurrentIndex((prev) => prev + 1);
                }, 1000); // 1초 대기 후 다음 메시지
            }

            // TTS 원본 코드 (나중에 복구용)
            // const voice = getVoiceByType(msg.type, agentAData, agentBData);
            // if (msg.type === ChatRole.AgentA) setIsSpeakingA(true);
            // else if (msg.type === ChatRole.AgentB) setIsSpeakingB(true);
            // try {
            //     const { json, filename } = await fetchTTS(msg.message, voice);
            //     setLipSyncState(msg.type, json, filename, setLipSyncA, setLipSyncB);
            // } catch (error) {
            //     console.error("TTS fetch error:", error);
            // } finally {
            //     setIsSpeakingA(false);
            //     setIsSpeakingB(false);
            // }
        };

        if (currentIndex >= 0) play();
    }, [currentIndex, messagesToPlay]);
}
