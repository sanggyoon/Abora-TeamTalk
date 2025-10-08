import { RoleConfig } from "@/app/config/RoleConfig";
import {Role} from "@/app/types/enum";
import BadgeComponent from "@/app/Components/ui/BadgeComponent/BadgeComponent";

interface RoleBadgeProps{
    role : Role
}

export default function RoldBadge({role}:RoleBadgeProps) {
    const roleData = RoleConfig[role];

    return (
        <BadgeComponent
            color={roleData.color}
            name={roleData.name}
            role={roleData.role}
            iconSrc="/icons/planner.png"
        />
    );
}
