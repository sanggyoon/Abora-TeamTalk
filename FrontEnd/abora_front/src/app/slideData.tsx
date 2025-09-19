import Avatar_GPT from './Components/Avatar/Avatar_GPT';
import Avatar_Gemini from './Components/Avatar/Avatar_Gemini';
import Avatar_Claude from './Components/Avatar/Avatar_Claude';
import Avatar_Llama from './Components/Avatar/Avatar_Llama';

const slideData = [
    {
        name: '분석적인 상균',
        model: 'Chat-GPT',
        description: '사실적 기반 분석',
        Component: Avatar_GPT,
        glb: '/models/sanggyun.glb',
        voice : 'ko-KR-Chirp3-HD-Achird',
    },
    {
        name: '철학적인 동년',
        model: 'Claude',
        description: '철학적 기반 분석',
        Component: Avatar_Claude,
        glb: '/models/dongnyeon.glb',
        voice: 'ko-KR-Wavenet-D',
    },
    {
        name: '감성적인 채영',
        model: 'Gemini',
        description: '감정 기반 분석',
        Component: Avatar_Gemini,
        glb: '/models/chaeyoung.glb',
        voice :'ko-KR-Chirp3-HD-Achernar',
    },
    {
        name: '실무적인 정민',
        model: 'Copilot',
        description: '실무적 기반 분석',
        Component: Avatar_Llama,
        glb: '/models/jungmin.glb',
        voice: 'ko-KR-Wavenet-B',
    },
];

export default slideData;