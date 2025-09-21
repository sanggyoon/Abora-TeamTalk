import styles from "./SenarioBlock.module.css";
import common from "@/app/Components/common/common.module.css";
import Image from "next/image";
import DescTitleBlock from "@/app/Components/DescTitleBlock/DescTitleBlock";

interface AvatarBlockProps {
    as?: "div" | "button";
    imageSrc: string;
    imageAlt?: string;
    description: string;
    goal: string;
    points: string[];
    onClick?: () => void;
    inlineStyle?: React.CSSProperties;
}

export default function AvatarBlock({
                                         as: Tag = "div",
                                         imageSrc,
                                         imageAlt = "image",
                                         description,
                                         goal,
                                         points,
                                         onClick,
                                         inlineStyle,
                                     }: AvatarBlockProps) {
    return (
        <Tag className={common.background} style={inlineStyle} onClick={onClick}>
            <Image
                src={imageSrc}
                alt={imageAlt}
                width={100}
                height={100}
                style={{ borderRadius: "8px" }}
            />

            <div className={styles.desc}>
                <p>{description}</p>
            </div>

            <div>
                <DescTitleBlock text="목표" />
                <p>{goal}</p>
            </div>

            <div>
                <DescTitleBlock text="학습포인트" />
                <ul className={styles.pointList}>
                    {points.map((point, idx) => (
                        <li key={idx}>{point}</li>
                    ))}
                </ul>
            </div>
        </Tag>
    );
}
