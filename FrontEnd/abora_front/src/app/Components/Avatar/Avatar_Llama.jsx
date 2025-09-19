import React from 'react';
import { useGLTF } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

// export default function Avatar_Llama(props){
//     const { scene } = useGLTF('/models/chaeyoung.glb')
//     return <primitive object={scene} position={[0, 0, 0]} {...props} />
// }

import { useMemo, forwardRef } from 'react';

const Avatar_Llama = forwardRef((props, ref) => {
  const { scene } = useGLTF('/models/jungmin.glb'); // 각자 모델 경로 맞게 변경
  const cloned = useMemo(() => clone(scene), [scene]);
  return <primitive object={cloned} ref={ref} {...props} />;
});

useGLTF.preload('/models/jungmin.glb');
export default Avatar_Llama;
