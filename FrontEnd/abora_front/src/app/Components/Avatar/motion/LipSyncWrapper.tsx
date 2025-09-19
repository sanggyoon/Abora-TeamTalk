// import React, { useEffect, useState } from 'react';
// import * as THREE from 'three';
// // @ts-ignore
// import Hangul from 'hangul-js';
// import mapKoreanToShape from '../../../utils/mapKoreanToShape';
// import LipSyncAvatar from './LipSyncAvatar';
//
// type Props = {
//     glbPath: string;
//     jsonFilename: string;
//     mp3Filename: string;
//     ModelComponent: React.ForwardRefExoticComponent<
//         React.PropsWithoutRef<Record<string, unknown>> &
//         React.RefAttributes<THREE.Object3D>
//     >;
// };
//
// type Segment = {
//     text: string;
//     start: number;
//     end: number;
// };
//
// type TimelineItem = {
//     phoneme: string;
//     start: number;
//     end: number;
// };
//
// export default function LipSyncWrapper({
//                                            glbPath,
//                                            jsonFilename,
//                                            mp3Filename,
//                                            ModelComponent
//                                        }: Props) {
//     const [currentPhoneme, setCurrentPhoneme] = useState<string>('Idle');
//     const [currentAction, setCurrentAction] = useState<string>('Idle');
//
//     useEffect(() => {
//         const playWithLipSync = async () => {
//             const jsonRes = await fetch(`http://localhost:8000/tts/${jsonFilename}`);
//             const segments: Segment[] = await jsonRes.json();
//
//             const timeline: TimelineItem[] = [];
//
//             //립싱크 타이밍 제어
//             for (const { text, start, end } of segments) {
//                 const jamos = Hangul.disassemble(text).filter((j:any) => j.trim());
//                 const duration = end - start;
//                 const per = duration / jamos.length;
//
//                 jamos.forEach((j:any, i:any) => {
//                     const phoneme = mapKoreanToShape(j);
//                     timeline.push({
//                         phoneme,
//                         start: +(start + i * per).toFixed(2),
//                         end: +(start + (i + 1) * per).toFixed(2),
//                     });
//                 });
//             }
//
//             //타이밍 + mp3 동시 재생
//             //const audio = new Audio(`http://localhost:8000/tts/${mp3Filename}`);
//             const startTime = Date.now();
//
//             //4. 순차적으로 audio 재생
//             const audio = new Audio(`http://localhost:8000/tts/${mp3Filename}`);
//             await new Promise((resolve) => {
//
//                 audio.onplay = () => {
//                     setCurrentAction('Breath');
//
//                     timeline.forEach(({ phoneme, start, end }) => {
//                         setTimeout(() => setCurrentPhoneme(phoneme), start * 1000);
//                         setTimeout(() => setCurrentPhoneme('Idle'), end * 1000);
//                     });
//
//                     const last = timeline[timeline.length - 1];
//                     setTimeout(() => setCurrentAction('Idle'), last.end * 1000);
//                 };
//                 audio.onended = resolve;
//                 audio.play();
//             });
//
//         };
//
//         playWithLipSync();
//     }, [jsonFilename, mp3Filename]);
//
//     return (
//         <>
//             <Breath ModelComponent={ModelComponent} glbPath={glbPath} currentAction={currentAction} />
//         </>
//     );
// }
