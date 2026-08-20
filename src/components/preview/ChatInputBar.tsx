'use client';

import React from 'react';
import styles from '@/styles/preview.module.css';
import { Plus, Camera, Mic, Smile } from 'lucide-react';

interface ChatInputBarProps {
  isDark: boolean;
}

export function ChatInputBar({ isDark }: ChatInputBarProps) {
  return (
    <div className={`${styles.inputBar} ${isDark ? styles.inputBarDark : ''}`}>
      <button className={styles.inputOuterIcon} aria-label="Add attachment">
        <Plus size={24} />
      </button>
      <div className={`${styles.inputField} ${isDark ? styles.inputFieldDark : ''}`}>
        <span className={styles.inputPlaceholder}>Type a message</span>
        <button className={styles.inputIcon} aria-label="Emoji">
          <Smile size={20} />
        </button>
      </div>
      <button className={styles.inputOuterIcon} aria-label="Camera">
        <Camera size={22} />
      </button>
      <button className={styles.inputOuterIcon} aria-label="Voice message">
        <Mic size={22} />
      </button>
    </div>
  );
}
