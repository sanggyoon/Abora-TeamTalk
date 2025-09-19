import slideData from '../slideData';
import AvatarScene from './Avatar/AvatarScene';
import ModelController from './Avatar/motion/ModelController';

export default async function handleSendMessage(
  voiceA: string,
  voiceB: string,
  inputValue: string,
  setLipSyncA: React.Dispatch<
    React.SetStateAction<{ json: string; mp3: string } | null>
  >,
  setLipSyncB: React.Dispatch<
    React.SetStateAction<{ json: string; mp3: string } | null>
  >,
  setInputValue: React.Dispatch<React.SetStateAction<string>>,
  setMessages: React.Dispatch<
    React.SetStateAction<
      {
        speaker: string;
        message: string;
        type: 'user' | 'agentA' | 'agentB';
        timestamp: string;
      }[]
    >
  >,
  setMessagesToPlay: React.Dispatch<
      React.SetStateAction<
          {
            speaker: string;
            message: string;
            type: 'agentA' | 'agentB';
            timestamp: string;
          }[]
      >
  >,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>

): Promise<void> {
  if (inputValue.trim() === '') return;
  // 1. 사용자 입력 메시지 추가
  setMessages((prev) => [
    ...prev,
    {
      speaker: '사용자',
      message: inputValue,
      type: 'user',
      timestamp: new Date().toLocaleString(),
    },
  ]);

  // 1-1. input값을 공백으로 만듬
  setInputValue('');

  try {
    // 2. 백엔드로 메시지 전송
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userprompt: inputValue }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch response from the server');
    }

    const data = await response.json();

    // 백엔드에서 받은 conversation 추가
    type ConversationItem = { speaker: string; message: string };
    const newMessages = data.conversation.map(
      (item: ConversationItem, index: number) => ({
        speaker: item.speaker,
        message: item.message,
        type: index % 2 === 0 ? 'agentA' : 'agentB', // 짝수는 AgentA, 홀수는 AgentB
        timestamp: new Date().toLocaleString(),
      }));


    setMessagesToPlay(newMessages);       // 전체 메시지 큐 설정
    setCurrentIndex(0);                   // 첫 메시지부터 시작
    // 모든 메시지 처리 완료 후 mp3/json 삭제 요청



  } catch (error) {
    console.error('Error:', error);
  }


}

