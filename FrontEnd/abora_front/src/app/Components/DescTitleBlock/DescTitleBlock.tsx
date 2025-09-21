import style from "./DescTitleBlock.module.css"

interface DescTitleProps {
    text?: string;       // 기존 문자열
    textColor?: string;
    backgroundColor? : string;
    children?: React.ReactNode; // 추가
}

export default function DescTitleBlock({
                                           text,
                                           textColor = "white",
                                           children,
                                           backgroundColor = "black"
                                       }: DescTitleProps) {
    return (
        <div
            className={style.textWrapper}
            style={{color: textColor, backgroundColor: backgroundColor}}
        >
            {text && <span className={style.textWrapper}>{text}</span>}
            {children}
        </div>
    );
}
