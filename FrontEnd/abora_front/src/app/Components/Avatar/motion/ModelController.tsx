import { useGLTF, useAnimations } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as Hangul from 'hangul-js';
import mapKoreanToShape from '../../../utils/mapKoreanToShape';

type Props = {
    ModelComponent: React.ForwardRefExoticComponent<any>;
    glbPath: string;
    currentAction?: string;
    jsonFilename?: string;
    mp3Filename?: string;
    onAudioEnd?: () => void;
};

type TimelineItem = {
    phoneme: string;
    start: number;
    end: number;
};

export default function ModelController({
                                            ModelComponent,
                                            glbPath,
                                            currentAction = 'breath',
                                            jsonFilename,
                                            mp3Filename,
                                            onAudioEnd
                                        }: Props) {
    const modelRef = useRef<THREE.Object3D>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);

    const { animations } = useGLTF(glbPath);
    const { actions } = useAnimations(animations, modelRef);

    const [currentPhoneme, setCurrentPhoneme] = useState<'AA' | 'II' | 'UU' | 'EE' | 'OO' | 'Idle'>('Idle');
    const [targetInfluences, setTargetInfluences] = useState<number[]>(Array(7).fill(0)); // 0~6

    const phonemeToIndex: Record<typeof currentPhoneme, number> = {
        Idle: 1,
        AA: 2,
        II: 3,
        UU: 4,
        EE: 5,
        OO: 6,
    };

    // ✅ 립싱크 + 음성 동기화
    useEffect(() => {
        if (!jsonFilename || !mp3Filename) return;

        const playWithLipSync = async () => {
            const res = await fetch(`http://localhost:8000/tts/json/${jsonFilename}`);
            const segments: { text: string; start: number; end: number }[] = await res.json();

            if (!Array.isArray(segments)) {
                console.error('Invalid JSON structure:', segments);
                return;
            }

            const timeline: TimelineItem[] = [];

            for (const { text, start, end } of segments) {
                const jamos = Hangul.disassemble(text).filter((j: string) => j.trim());
                const duration = end - start;
                const per = duration / jamos.length;

                if (jamos.length === 0) {
                    timeline.push({ phoneme: 'II', start, end });
                } else {
                    jamos.forEach((j: string, i: number) => {
                        const phoneme = mapKoreanToShape(j);
                        timeline.push({
                            phoneme,
                            start: +(start + i * per).toFixed(2),
                            end: +(start + (i + 1) * per).toFixed(2),
                        });
                    });
                }
            }

            const audio = new Audio(`http://localhost:8000/public/tts/${mp3Filename}`);

            audio.onplay = () => {
                timeline.forEach(({ phoneme, start, end }) => {
                    setTimeout(() => setCurrentPhoneme(phoneme), start * 1000);
                    setTimeout(() => setCurrentPhoneme('Idle'), end * 1000);
                });
            };

            await new Promise<void>((resolve) => {
                audio.onended = () => {
                    onAudioEnd?.(); // 외부로 재생 끝 알림
                    resolve();
                };
                audio.play();
            });


        };

        playWithLipSync();
    }, [jsonFilename, mp3Filename]);

    // 입모양 쉐이프키 변경
    useEffect(() => {
        const newTargets = Array(7).fill(0);
        const index = phonemeToIndex[currentPhoneme];

        if (currentPhoneme === 'Idle') {
            newTargets[1] = 1;
        } else if (index !== undefined && index !== null) {
            newTargets[index] = 1;
        }

        setTargetInfluences(newTargets);
    }, [currentPhoneme]);

    // 부드럽게 쉐이프키 적용
    useFrame(() => {
        if (!meshRef.current || !meshRef.current.morphTargetInfluences) return;
        const influences = meshRef.current.morphTargetInfluences;
        for (let i = 0; i < targetInfluences.length; i++) {
            influences[i] += (targetInfluences[i] - influences[i]) * 0.2;
        }
    });

    // 🤖 입모양 타겟 메쉬 찾아오기
    useEffect(() => {
        if (!modelRef.current) return;
        modelRef.current.traverse((child: any) => {
            if (child.isMesh && child.morphTargetInfluences && child.name.toLowerCase().includes('mouse')) {
                meshRef.current = child;
            }
        });
    }, []);

    // 애니메이션 전환
    useEffect(() => {
        if (!actions || !currentAction) return;

        const mappedAction =
            currentAction === 'Reading' ? 'left_Reading' :
                currentAction === 'Idle' ? 'breath' :
                    currentAction;

        Object.values(actions).forEach((action) => {
            if (action) action.fadeOut(0.2);
        });

        const actionToPlay = actions[mappedAction];
        if (actionToPlay) {

            if (mappedAction === 'left_pending' || mappedAction === 'right_pending') {
                actionToPlay.timeScale = 0.5; // 원래 속도의 60%
            } else {
                actionToPlay.timeScale = 1.0; // 나머지는 기본 속도
            }


            actionToPlay.reset().fadeIn(0.3).play();
        } else {
            console.warn(" 애니메이션 없음:", mappedAction);
        }
    }, [actions, currentAction]);

    return <ModelComponent ref={modelRef} />;
}
