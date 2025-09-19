import { useGLTF } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

// export default function Avatar_GPT(props) {
//     const { scene } = useGLTF('/models/jungmin.glb')
//     const clonedScene = clone(scene) // ✅ 반드시 clone 해야 StrictMode에서 안깨짐
//
//     return <primitive object={clonedScene} {...props} />
// }
//
// useGLTF.preload('/models/jungmin.glb')

import { useMemo, forwardRef } from 'react';

const Avatar_Gemini = forwardRef((props, ref) => {
  const { scene } = useGLTF('/models/chaeyoung.glb'); // 각자 모델 경로 맞게 변경
  const cloned = useMemo(() => clone(scene), [scene]);
  return <primitive object={cloned} ref={ref} {...props} />;
});

useGLTF.preload('/models/chaeyoung.glb');
export default Avatar_Gemini;
