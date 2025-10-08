import {Role} from "@/app/types/enum";
import Avatar_GPT from "@/app/Components/Avatar/Avatar_GPT";
import Avatar_Claude from "@/app/Components/Avatar/Avatar_Claude";
import Avatar_Llama from "@/app/Components/Avatar/Avatar_Llama";

export const RoleConfig = {
    [Role.Developer]: { color: "#747474", role: "개발자",
        name:"Devu",
        personality: {
            title: "성격",
            desc: "꼼꼼하고 현실적, 가끔 직설적",
        },
        interest: {
            title: "관심사",
            desc: "코드 품질, 성능 최적화, 기술 부재",
        },
        IconImageSrc: "/iconImage/roleIcon1.png",
        profileImageSrc: "/icon/PersonaProfileIcon/Developer.png",
        Component: Avatar_GPT,
        glb: '/models/sanggyun.glb',
        voice : "ko-KR-Chirp3-HD-Achird",
    },
    [Role.Planner]: { color: "#C58B3A", role: "기획자", name:"Dune",
        personality: {
            title: "성격",
            desc: "논리적이지만 친근하고, 질문을 많이 함",
        },
        interest: {
            title: "관심사",
            desc: "비즈니스 임팩트, 사용자 니즈, ROI",
        },
        IconImageSrc: "/iconImage/roleIcon2.png",
        profileImageSrc: "/icon/PersonaProfileIcon/Planner.png",
        Component: Avatar_Claude,
        glb: '/models/dongnyeon.glb',
        voice: "ko-KR-Wavenet-D",
    },
    [Role.Designer]: { color: "#997EFF", role: "디자이너", name:"Soni",
        personality: {
            title: "성격",
            desc: "창의적이고 사용자 중심적, 감성적 접근",
        },
        interest: {
            title: "관심사",
            desc: "사용자 경험, 접근성, 브랜드 일관성",
        },
        IconImageSrc: "/iconImage/roleIcon3.png",
        profileImageSrc: "/icon/PersonaProfileIcon/Designer.png",
        Component: Avatar_Llama,
        glb: '/models/jungmin.glb',
        voice: "ko-KR-Wavenet-B",

    },
};