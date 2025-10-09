import {Role} from "@/app/types/enum";
import roleToKorean from "@/app/config/mapKorean";


export function getRoleByKorean(korean: string): Role | undefined {
    // Object.entries(roleToKorean): [["Developer","개발자"], ["Designer","디자이너"], ["Planner","기획자"]]
    const entry = Object.entries(roleToKorean).find(([, value]) => value === korean);
    return entry ? (entry[0] as Role) : undefined;
}
