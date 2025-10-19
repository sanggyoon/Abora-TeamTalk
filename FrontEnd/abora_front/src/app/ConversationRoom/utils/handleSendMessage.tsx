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
    const data: ResponseChatResponse = await sendChatMessage(inputValue);
    console.log("data:", data);

    // 3. 백엔드에서 받은 messages 배열 처리
    if (!data.success || !data.messages || data.messages.length === 0) {
      console.error("응답 데이터가 올바르지 않습니다.");
      return;
    }

    // 4. 두 개의 AI 답변을 ClientChatMessage 배열로 변환
    const newMessages: ClientChatMessage[] = data.messages.map((msg) => {
      const aiRoleEnglish = getRoleByKorean(msg.ai_role);
      const type = aiRoleEnglish === agentA ? ChatRole.AgentA : aiRoleEnglish === agentB ? ChatRole.AgentB : ChatRole.User;

      return {
        speaker: msg.ai_role ?? "AI",
        message: msg.content ?? "",
        type: type,
        timestamp: new Date(msg.created_at).toLocaleString(),
      };
    });

    console.log("newMessages:", newMessages);

    // 5. 두 메시지를 순차적으로 재생 준비
    setMessagesToPlay(newMessages);  // 전체 메시지 큐 설정 (2개)
    setCurrentIndex(0);              // 첫 메시지부터 시작

  } catch (error) {
    console.error('Error:', error);
  }


}

