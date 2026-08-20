'use client';

import React from 'react';
import styles from '@/styles/preview.module.css';

interface TypingIndicatorProps {
  isDark: boolean;
  sender?: 'me' | 'them';
  senderName?: string;
  senderColor?: string;
}

export function TypingIndicator({
  isDark,
  sender = 'them',
  senderName,
  senderColor,
}: TypingIndicatorProps) {
  const isOutgoing = sender === 'me';
  const rowClasses = [
    styles.bubbleRow,
    isOutgoing ? styles.bubbleRowOutgoing : '',
  ].filter(Boolean).join(' ');
  const bubbleClasses = [
    styles.bubble,
    isOutgoing ? styles.bubbleOutgoing : styles.bubbleIncoming,
    isDark ? (isOutgoing ? styles.bubbleOutgoingDark : styles.bubbleIncomingDark) : '',
    styles.bubbleFirst,
    styles.typingBubble,
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClasses}>
      <div className={bubbleClasses}>
        <div
          className={`${styles.bubbleTail} ${
            isOutgoing ? styles.bubbleTailOutgoing : styles.bubbleTailIncoming
          } ${isDark ? styles.bubbleTailDark : ''}`}
        >
          <svg viewBox="0 0 8 13" width="8" height="13">
            {isOutgoing ? (
              <path
                fill={isDark ? '#005C4B' : '#D7FFD8'}
                d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"
              />
            ) : (
              <path
                fill={isDark ? '#202C33' : '#FFFFFF'}
                d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"
              />
            )}
          </svg>
        </div>
        {!isOutgoing && senderName && (
          <div className={styles.senderName} style={{ color: senderColor }}>
            {senderName}
          </div>
        )}
        <div className={styles.typingIndicator}>
          <span className={`${styles.typingDot} ${styles.typingDot1}`} />
          <span className={`${styles.typingDot} ${styles.typingDot2}`} />
          <span className={`${styles.typingDot} ${styles.typingDot3}`} />
        </div>
      </div>
    </div>
  );
}
