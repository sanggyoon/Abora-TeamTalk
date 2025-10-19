import React from 'react';
import styles from './LoadingComponent.module.css';
import {ChatRole} from "@/app/types/enum";

interface LoadingComponentProps {
  type: ChatRole.AgentA | ChatRole.AgentB;
  isActive: boolean;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({
  type,
  isActive,
}) => {
  return (
    <div
      className={`${styles.square} ${
        type === ChatRole.AgentA ? styles.agentA : styles.agentB
      } ${isActive ? styles.active : ''}`}
    >
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default LoadingComponent;
