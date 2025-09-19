import React from 'react';
import styles from './LoadingComponent.module.css';

interface LoadingComponentProps {
  type: 'agentA' | 'agentB';
  isActive: boolean;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({
  type,
  isActive,
}) => {
  return (
    <div
      className={`${styles.square} ${
        type === 'agentA' ? styles.agentA : styles.agentB
      } ${isActive ? styles.active : ''}`}
    >
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default LoadingComponent;
