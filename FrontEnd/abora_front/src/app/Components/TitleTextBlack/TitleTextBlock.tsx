import style from "./TitleTextBlock.module.css"

interface TitleTextBlockProps {
    text?: string;       // 기존 문자열
    textColor?: string;
    backgroundColor? : string;
    children?: React.ReactNode; // 추가
}

export default function TitleTextBlock({
                                           text,
                                           textColor = "white",
                                           children,
                                           backgroundColor = "black"
                                       }: TitleTextBlockProps) {
    return (
        <div
            className={style.textWrapper}
            style={{color: textColor, backgroundColor: backgroundColor}}
        >
            {text && <span className={style.text}>{text}</span>}
            {children}
        </div>
    );
}
