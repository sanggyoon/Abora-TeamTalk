// // @ts-ignore
// import Hangul from 'hangul-js';
// import mapKoreanToShape from './mapKoreanToShape';
//
// type TimelineItem = {
//     phoneme: string;
//     start: number;
//     end: number;
// };
//
// export async function getLipSyncTimeline(jsonFilename: string) {
//     const res = await fetch(`http://localhost:8000/tts/${jsonFilename}`);
//     const segments = await res.json();
//
//     const timeline:TimelineItem[]= [];
//
//     for (const { text, start, end } of segments) {
//         const jamos = Hangul.disassemble(text).filter((j:any) => j.trim());
//         const duration = end - start;
//         const per = duration / jamos.length;
//
//         jamos.forEach((j:any, i:any) => {
//             timeline.push({
//                 phoneme: mapKoreanToShape(j),
//                 start: +(start + i * per).toFixed(2),
//                 end: +(start + (i + 1) * per).toFixed(2),
//             });
//         });
//     }
//
//     return timeline;
// }
