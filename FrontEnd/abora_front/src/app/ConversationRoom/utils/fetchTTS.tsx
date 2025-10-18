export async function fetchTTS(text: string, voice: string) {
    const res = await fetch('http://localhost:8000/tts/speak', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
    });

    if (!res.ok) throw new Error("TTS 요청 실패");

    const data = await res.json();

    return {
        json: data.json,
        filename: data.filename
    };
}
