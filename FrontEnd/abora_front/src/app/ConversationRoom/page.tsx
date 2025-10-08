'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import LoadingComponent from '../Components/LoadingComponent';
import styles from './page.module.css';
import { useSearchParams } from 'next/navigation';
import AvatarScene from '../Components/Avatar/AvatarScene';
import slideData from '../slideData';
import handleSendMessage from '../Components/handleSendMessage';

import {
  UserBubble,
  AgentABubble,
  AgentBBubble,
} from '../Components/ChatBubble';
import InitialScrambleText from '../Components/GSAP/InitialScrambleText';
import {ChatRole, Role} from "@/app/types/enum";
import {RoleConfig} from "@/app/config/RoleConfig";

function ConversationContent() {

  //코드에서 변수명을 바꾸는 일이 없도록 하기 위해 이곳에서 모든 변수의 값을 관리합니다.
  type AgentData = (typeof RoleConfig)[keyof typeof RoleConfig]; //? 이게뭐지

  const searchParams = useSearchParams();
  //agent
  const agentA = searchParams?.get("agentA") as Role;
  const agentB = searchParams?.get("agentB") as Role;

  //agentData
  const agentAData : AgentData = RoleConfig[agentA];
  const agentBData : AgentData = RoleConfig[agentB];

  // voice 탐색
  const voiceA = agentAData.voice;
  const voiceB = agentBData.voice;

  //현재 시간
  const currentTime = new Date().toLocaleString();
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [inputValue, setInputValue] = useState('');
  const [messagesToPlay, setMessagesToPlay] = useState([]);
  const [messages, setMessages] = useState<
    {
      speaker: string;
      message: string;
      type: ChatRole;
      timestamp: string;
    }[]
  >([]);

  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [currentSpeaker, setCurrentSpeaker] = useState<ChatRole | null>(null); //null이 있으면 안되는거 아님?

  const chatBoxRef = useRef<HTMLDivElement>(null); // 채팅 영역 참조


  // 립싱크 제어
  const [lipSyncA, setLipSyncA] = useState<{
    json: string;
    mp3: string;
  } | null>(null);
  const [lipSyncB, setLipSyncB] = useState<{
    json: string;
    mp3: string;
  } | null>(null);


  const [isSpeakingA, setIsSpeakingA] = useState(false);
  const [isSpeakingB, setIsSpeakingB] = useState(false);


  // 상호작용에 따른 모션 제어
  const currentActionA = isLoading
      ? 'left_pending' : isSpeakingA ? 'breath' : currentSpeaker === 'agentB' ? 'left_pending'
      : isFocused
          ? 'left_reading'
          : 'breath';

  const currentActionB = isLoading
      ? 'right_pending' : isSpeakingB ? 'breath' :currentSpeaker === 'agentA' ? 'right_pending'
      : isFocused
          ? 'right_reading'
          : 'breath';


  const renderAvatar = (
    agent: Role,
    currentAction: string,
    lipSync: { json: string; mp3: string } | null,
    onAudioEnd: () => void
  ) => {
    const roleData = RoleConfig[agent];

    if (!agent) return null;
    return (
      <AvatarScene
        ModelComponent={roleData.Component}
        glbPath={roleData.glb}
        currentAction={currentAction}
        jsonFilename={lipSync?.json}
        mp3Filename={lipSync?.mp3}
        onAudioEnd={onAudioEnd}
      />
    );
  };

  // 메시지가 변경될 때 마지막 메시지를 기반으로 currentSpeaker 업데이트
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'agentA' || lastMessage.type === 'agentB') {
        setCurrentSpeaker(lastMessage.type);
      }
    }
  }, [messages]);

  useEffect(() => {
    const play = async () => {
      const msg = messagesToPlay[currentIndex];//현재 인덱스의 메시지를 읽어야됨

      if (!msg) return;

      setMessages((prev) => [...prev, msg]);

      const voice = msg.type === 'agentA' ? agentAData.voice : agentBData.voice; //메시지의 타입?

      if (msg.type === agentAData) setIsSpeakingA(true);
      else if (msg.type === agentBData.voice) setIsSpeakingB(true);

      const res = await fetch('http://localhost:8000/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.message, voice }),
      });

      const data = await res.json();
      const filename = data.filename;
      const json = data.json;

      const setLipSync = msg.type === 'agentA' ? setLipSyncA : setLipSyncB;
      setLipSync({ json, mp3: filename });
    };

    if (currentIndex >= 0) play();
  }, [currentIndex]);

  // 메시지가 추가될 때마다 스크롤을 가장 하단으로 이동
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessageWithLoading = async () => {
    setIsLoading(true); // 로딩 시작
    try {
      // 메시지 전송 로직
      await handleSendMessage(
        voiceA || 'defaultVoiceA',
        voiceB || 'defaultVoiceB',
        inputValue,
        setLipSyncA,
        setLipSyncB,
        setInputValue,
        setMessages,
        setMessagesToPlay,
        setCurrentIndex,
      );
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  return (
    <>
      <div className={styles.conversationRoomContainer}>
        {/* 에이전트 A */}
        <div className={styles.choosenAgent_A}>
          {(isLoading || isSpeakingA) && (
              <LoadingComponent
                  type="agentA"
                  isActive={currentSpeaker === 'agentA'}
              />
          )}
          <div className={styles.agent_A_avatar}>
            <div className={styles.name_agentA}>
              <InitialScrambleText to={agentA}/>
            </div>
            {renderAvatar(agentA, currentActionA, lipSyncA, () => {
              setIsSpeakingA(false); // 재생 종료
              if (currentSpeaker === 'agentA')
                if (currentIndex + 1 >= messagesToPlay.length) {
                setCurrentSpeaker(null); // 모든 메시지 끝났을 때 초기화
              } else {
                setCurrentIndex((prev) => prev + 1);
              }
            })}
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className={styles.chatBox} ref={chatBoxRef}>
          <AgentABubble
            message={`안녕, 나는 <b>${agentAData.name}</b>이야.`}
            timestamp={currentTime}
          />
          <AgentBBubble
            message={`안녕, 나는  <b>${agentBData.name}</b>이야.`}
            timestamp={currentTime}
          />
          {messages.map((msg, index) => {
            if (msg.type === 'user') {
              return (
                <UserBubble
                  key={index}
                  message={msg.message}
                  timestamp={msg.timestamp}
                />
              );
            } else if (msg.type === 'agentA') {
              return (
                <AgentABubble
                  key={index}
                  message={msg.message}
                  timestamp={msg.timestamp}
                />
              );
            } else if (msg.type === 'agentB') {
              return (
                <AgentBBubble
                  key={index}
                  message={msg.message}
                  timestamp={msg.timestamp}
                />
              );
            }
            return null;
          })}
        </div>

        {/* 에이전트 B */}
        <div className={styles.choosenAgent_B}>
          {(isLoading || isSpeakingB) && (
              <LoadingComponent
                  type="agentB"
                  isActive={currentSpeaker === 'agentB'}
              />
          )}
          <div className={styles.agent_B_avatar}>
            <div className={styles.name_agentB}><InitialScrambleText to={agentB}/></div>
            {renderAvatar(agentB, currentActionB, lipSyncB, () => {
              setIsSpeakingB(false); // 재생 종료
              if (currentSpeaker === 'agentB')
                if (currentIndex + 1 >= messagesToPlay.length) {
                setCurrentSpeaker(null); // 모든 메시지 끝났을 때 초기화
              } else {
                setCurrentIndex((prev) => prev + 1);
              }
            })}
          </div>
        </div>
      </div>

      {/* 채팅 입력 영역 */}
      <div className={styles.chatInput}>
        <input
          type="text"
          placeholder="ex) " //예시 주석 달아주세요
          value={inputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && !isLoading) {
              handleSendMessageWithLoading();
            }
          }}
          disabled={isLoading} // isLoading이 true일 때 비활성화
        />
        <button
          className={styles.button_send}
          onClick={handleSendMessageWithLoading}
          disabled={isLoading} // isLoading이 true일 때 비활성화
        >
          Send
        </button>
      </div>
    </>
  );
}

export default function ConversationRoom() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConversationContent />
    </Suspense>
  );
}
