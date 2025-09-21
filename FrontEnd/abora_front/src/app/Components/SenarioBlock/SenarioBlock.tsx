import styles from "./SenarioBlock.module.css";
import common from "@/app/Components/common/common.module.css";
import Image from "next/image";
import DescTitleBlock from "@/app/Components/DescTitleBlock/DescTitleBlock";

interface SenarioBlockProps {
    as?: "div" | "button";
    imageSrc: string;
    imageAlt?: string;
    title: string;
    level: string; // 초급자용, 중급자용, 고급자용
    description: string;
    goal: string;
    points: string[];
    onClick?: () => void;
    inlineStyle?: React.CSSProperties;
}

export default function SenarioBlock({
                                         as: Tag = "div",
                                         imageSrc,
                                         imageAlt = "image",
                                         title,
                                         level,
                                         description,
                                         goal,
                                         points,
                                         onClick,
                                         inlineStyle,
                                     }: SenarioBlockProps) {
    return (
        <Tag className={common.background} style={inlineStyle} onClick={onClick}>
            <div>
                <h3
                    style={{
                        marginTop: "12px",
                        fontSize: "1.2rem",
                        fontWeight: "600",
                        color: "black",
                    }}
                >
                    {title}
                </h3>
                <div>{level}</div>
            </div>

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
