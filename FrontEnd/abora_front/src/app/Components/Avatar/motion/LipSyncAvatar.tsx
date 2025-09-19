// import React, { useRef, useEffect, useState } from 'react';
// import { useGLTF } from '@react-three/drei';
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';
//
// type Props = {
//     glbPath: string;
//     currentPhoneme: 'AA' | 'II' | 'UU' | 'EE' | 'OO' | 'Idle';
// };
//
// const LipSyncAvatar: React.FC<Props> = ({ glbPath, currentPhoneme }) => {
//     const { scene } = useGLTF(glbPath);
//     const meshRef = useRef<THREE.Mesh | null>(null);
//     const [targetInfluences, setTargetInfluences] = useState<number[]>(Array(6).fill(0));
//
//     const phonemeToIndex: Record<Props['currentPhoneme'], number> = {
//         AA: 3,
//         II: 4,
//         UU: 5,
//         EE: 6,
//         OO: 7,
//         Idle: 2
//     };
//
//     useEffect(() => {
//         const newTargets = Array(6).fill(0);
//         const index = phonemeToIndex[currentPhoneme];
//         if (index !== undefined) newTargets[index] = 1;
//         setTargetInfluences(newTargets);
//     }, [currentPhoneme]);
//
//     useFrame(() => {
//         if (!meshRef.current || !meshRef.current.morphTargetInfluences) return;
//         const influences = meshRef.current.morphTargetInfluences;
//         for (let i = 0; i < targetInfluences.length; i++) {
//             influences[i] += (targetInfluences[i] - influences[i]) * 0.2;
//         }
//     });
//
//     return (
//         <primitive
//             object={scene}
//             ref={(obj: THREE.Object3D | null) => {
//                 if (!obj) return;
//                 obj.traverse((child) => {
//                     if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).morphTargetInfluences) {
//                         meshRef.current = child as THREE.Mesh;
//                     }
//                 });
//             }}
//         />
//     );
// };
//
// export default LipSyncAvatar;
