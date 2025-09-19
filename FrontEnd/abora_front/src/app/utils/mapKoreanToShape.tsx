import React from "react";
// 한글 자모 → 입모양 이름 매핑
export default function mapKoreanToShape(jamo: string) {
    if ("ㅏㅑㅓㅕ".includes(jamo)) return "AA";
    if ("ㅣㅐㅔ".includes(jamo)) return "II";
    if ("ㅗㅛ".includes(jamo)) return "OO";
    if ("ㅜㅠㅡ".includes(jamo)) return "UU";
    if ("ㅁㅂㅍ".includes(jamo)) return "EE"; // 예외 처리로 사용
    return "Idle";
}

/*
* function mapKoreanToShape(jamo) {
    if ('ㅁㅂㅍ'.includes(jamo)) return 'M'
    if ('ㅏㅑ'.includes(jamo)) return 'A'
    if ('ㅔㅐㅣ'.includes(jamo)) return 'E'
    if ('ㅗㅛ'.includes(jamo)) return 'O'
    if ('ㅜㅠ'.includes(jamo)) return 'U'
    if ('ㄹ'.includes(jamo)) return 'L'
    if ('ㅅㅆㅈㅊ'.includes(jamo)) return 'S'
    if ('ㅎ'.includes(jamo)) return 'H'
    if ('ㄴㅇ'.includes(jamo)) return 'N'
    return 'SIL'
}

* */