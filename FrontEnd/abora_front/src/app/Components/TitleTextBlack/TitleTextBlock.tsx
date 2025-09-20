import style from "./TitleTextBlock.module.css"

interface TitleTextBlackProps{
    text:string;
    color?:string;
}

export default function TitleTextBlock({text,color="white"}:TitleTextBlackProps){
    return (
        <>
            <div className={style.textWrapper} style={{color: color}}>{text}</div>
        </>
    )
}