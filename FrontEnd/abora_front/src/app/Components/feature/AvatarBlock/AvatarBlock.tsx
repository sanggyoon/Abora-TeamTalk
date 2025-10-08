import common from "@/app/Components/common/common.module.css";
import DescTitleBlock from "@/app/Components/ui/DescTitleBlock/DescTitleBlock";
import {Role} from "@/app/types/enum";
import RoleBadge from "../../ui/RoleBadge/RoleBadge";
import {RoleConfig} from "@/app/config/RoleConfig";
import AvatarScene from "@/app/Components/Avatar/AvatarScene";

interface AvatarBlockProps {
    as?: "div" | "button";
    role : Role; //role 기반으로 가져옴
    onClick?: () => void;
    style?: React.CSSProperties;
}


export default function AvatarBlock({
                                         as: Tag = "div", role,
                                         onClick,
                                         style,
                                     }: AvatarBlockProps) {

    const roleData = RoleConfig[role];

    return (
        <Tag className={common.background} style={style} onClick={onClick}>

            <AvatarScene
                ModelComponent={roleData.Component}
                glbPath={roleData.glb}
                currentAction="breath"
            ></AvatarScene>
            <RoleBadge role={role}/>

            <div>
                <DescTitleBlock text={roleData.personality.title} />
                <p>{roleData.personality.desc}</p>
            </div>

            <div>
                <DescTitleBlock text={roleData.interest.title} />
                <p>{roleData.interest.desc}</p>
            </div>

        </Tag>
    );
}
