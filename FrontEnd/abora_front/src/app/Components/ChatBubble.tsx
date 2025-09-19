import React from 'react';
import styles from './ChatBubble.module.css';
import TypingText from './GSAP/TypingText';

type ChatBubbleProps = {
  message: string;
  timestamp?: string;
};

export const UserBubble: React.FC<ChatBubbleProps> = ({
  message,
  timestamp,
}) => (
  <div className={`${styles.userBubbleContainer} ${styles.bubbleAnimation}`}>
    {timestamp && <span className={styles.timestamp}>{timestamp}</span>}
    <div className={styles.userBubble}>
      <p>{message}</p>
    </div>
  </div>
);

export const AgentABubble: React.FC<ChatBubbleProps> = ({
  message,
  timestamp,
}) => (
  <div className={`${styles.agentABubbleContainer} ${styles.bubbleAnimation}`}>
    {timestamp && <span className={styles.timestamp}>{timestamp}</span>}
    <div className={styles.agentABubble}>
      <TypingText text = {message} className = {styles.agentBubble_typing}/>
    </div>
  </div>
);

export const AgentBBubble: React.FC<ChatBubbleProps> = ({
  message,
  timestamp,
}) => (
  <div className={`${styles.agentBBubbleContainer} ${styles.bubbleAnimation}`}>
    {timestamp && <span className={styles.timestamp}>{timestamp}</span>}
    <div className={styles.agentBBubble}>
        <TypingText text = {message} className = {styles.agentBubble_typing}/>
    </div>
  </div>
);
