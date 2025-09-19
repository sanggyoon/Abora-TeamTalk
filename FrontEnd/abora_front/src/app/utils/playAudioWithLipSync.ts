/*// utils/playAudioWithLipSync.ts
import Hangul from 'hangul-js';
import mapKoreanToShape from './mapKoreanToShape';

export type TimelineItem = {
    phoneme: string;
    start: number;
    end: number;
};

export const playAudioWithLipSync = async (
    jsonFilename: string,
    mp3Filename: string,
    setPhoneme: (p: string) => void
): Promise<void> => {
    const res = await fetch(`http://localhost:8000/tts/json/${jsonFilename}`);
    const segments: { text: string; start: number; end: number }[] = await res.json();

    if (!Array.isArray(segments)) {
        if (!Array.isArray(segments)) {
            console.error("Invalid JSON structure:", segments);
            return;
        }

        const timeline: TimelineItem[] = [];

        for (const {text, start, end} of segments) {
            const jamos = Hangul.disassemble(text).filter((j) => j.trim());
            const duration = end - start;
            const per = duration / jamos.length;

            jamos.forEach((j, i) => {
                timeline.push({
                    phoneme: mapKoreanToShape(j),
                    start: +(start + i * per).toFixed(2),
                    end: +(start + (i + 1) * per).toFixed(2),
                });
            });
        }

        const audio = new Audio(`http://localhost:8000/tts/${mp3Filename}`);
        const startTime = Date.now();

        audio.onplay = () => {
            timeline.forEach(({phoneme, start, end}) => {
                setTimeout(() => setPhoneme(phoneme), start * 1000);
                setTimeout(() => setPhoneme('Idle'), end * 1000);
            });
        };

        await new Promise((resolve) => {
            audio.onended = resolve;
            audio.play();
        });
    }
    ;
}*/
