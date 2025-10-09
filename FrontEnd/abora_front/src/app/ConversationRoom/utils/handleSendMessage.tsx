import {ChatRole} from "@/app/types/enum";
import {Message} from "@/app/types/interface";
import {sendChatMessage} from "@/app/utils/api/fetchChat";

export default async function handleSendMessage(
  inputValue: string,
  setInputValue: React.Dispatch<React.SetStateAction<string>>,
  setMessages: React.Dispatch<
    React.SetStateAction<Message[]>
  >,
  setMessagesToPlay: React.Dispatch<
      React.SetStateAction<Message[]
      >
  >,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>

): Promise<void> {
  if (inputValue.trim() === '') return;

  // 1. 사용자 입력 메시지 추가
  setMessages((prev) => [
    ...prev,
    {
      speaker: ChatRole.User,
      message: inputValue,
      type: ChatRole.User,
      timestamp: new Date().toLocaleString(),
    },
  ]);
  // 1-1. input값을 공백으로 만듬
  setInputValue('');

  try {
    // 2. 백엔드로 메시지 전송
    const data = await sendChatMessage(inputValue);
    console.log(data)

    // 3. 백엔드에서 받은 conversation 추가
    const newMessages = data.conversation.map(
      (item: { speaker: string; message: string }, index: number) => ({
        speaker: item.speaker,
        message: item.message,
        type: index % 2 === 0 ? ChatRole.AgentA : ChatRole.AgentB, // 짝수는 AgentA, 홀수는 AgentB
        timestamp: new Date().toLocaleString(),
      }));


    //4. 다음 메시지 재생 준비
    setMessagesToPlay(newMessages);       // 전체 메시지 큐 설정
    setCurrentIndex(0);                   // 첫 메시지부터 시작
    // 모든 메시지 처리 완료 후 mp3/json 삭제 요청

  } catch (error) {
    console.error('Error:', error);
  }


}

