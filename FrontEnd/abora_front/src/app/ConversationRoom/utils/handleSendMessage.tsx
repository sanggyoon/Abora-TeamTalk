import {ChatRole, Role} from "@/app/types/enum";
import {ClientChatMessage, Message, ResponseChatResponse} from "@/app/types/interface";
import {sendChatMessage} from "@/app/utils/api/fetchChat";
import {getRoleByKorean} from "@/app/ConversationRoom/utils/getRoleByKorean";

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
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
  agentA:Role,
  agentB:Role,
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
    const data:ResponseChatResponse = await sendChatMessage(inputValue);
    console.log("data :",data.content);
    console.log("data.content:", `"${data?.content}"`);
    console.log("data.content.length:", data?.content?.length);


    // 3. 백엔드에서 받은 conversation 추가
    // 기존 코드에서는 conversation으로 문맥 전체를 받아왔지만 --> 현재는 단일 대화로 받음. 때문에 하나만 처리하면됨.
    // const newMessages : ChatResponse = data.conversation.map(
    //   (item: { speaker: string; message: string }, index: number) => ({
    //     speaker: item.speaker,
    //     message: item.message,
    //     type: index % 2 === 0 ? ChatRole.AgentA : ChatRole.AgentB, // 짝수는 AgentA, 홀수는 AgentB
    //     timestamp: new Date().toLocaleString(),
    //   }));

    // ✅ conversation이 없으면 단일 메시지를 배열로 감싼다

    if(!data.success) return;

    const aiRoleEnglish = getRoleByKorean(data.ai_role)
    const type = aiRoleEnglish === agentA ? ChatRole.AgentA : aiRoleEnglish === agentB ? ChatRole.AgentB : ChatRole.User;

    const newMessage:ClientChatMessage = {
      speaker: data.ai_role ?? "AI",
      message: data.content ?? "",
      type: type, // 혹은 상황에 맞게 AgentA로 지정
      timestamp: new Date().toLocaleString(),
    };

    // 기존 state에 추가
    setMessages((prev) => [...prev, newMessage]);

    //4. 다음 메시지 재생 준비
    setMessagesToPlay(newMessages);       // 전체 메시지 큐 설정
    setCurrentIndex(0);                   // 첫 메시지부터 시작
    // 모든 메시지 처리 완료 후 mp3/json 삭제 요청

  } catch (error) {
    console.error('Error:', error);
  }


}

