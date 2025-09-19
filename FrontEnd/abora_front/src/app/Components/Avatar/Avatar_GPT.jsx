import { useGLTF } from '@react-three/drei'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import { forwardRef, useMemo } from 'react'


/*export default function Avatar_GPT(props) {
    const {scene} = useGLTF('/models/chaeyoung-breath.glb')
    const clonedScene = clone(scene) // ✅ 반드시 clone 해야 StrictMode에서 안깨짐

    return <primitive object={clonedScene} ref={props.modelRef} {...props} />
}

useGLTF.preload('/models/chaeyoung-breath.glb')
*/

// Avatar_GPT.tsx

// Avatar_GPT.tsx 예시
const Avatar_GPT = forwardRef((props, ref) => {
    const { scene } = useGLTF('/models/sanggyun.glb')
    const cloned = useMemo(() => clone(scene), [scene])
    return <primitive object={cloned} ref={ref} {...props} />
});

useGLTF.preload('/models/sanggyun.glb')
export default Avatar_GPT
