'use client';

import React from 'react';
import styles from '@/styles/phone.module.css';

interface StatusBarProps {
  isDark: boolean;
}

export function StatusBar({ isDark }: StatusBarProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className={`${styles.statusBar} ${isDark ? styles.statusBarDark : ''}`}>
      <div className={styles.statusBarTime}>{timeStr}</div>
      <div className={styles.statusBarIcons}>
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="9" width="3" height="3" rx="0.5" fill="currentColor" />
          <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="currentColor" />
          <rect x="9" y="3" width="3" height="9" rx="0.5" fill="currentColor" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 9.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM8 6.4c1.7 0 3.2.7 4.2 1.8l-1.2 1.2c-.7-.8-1.8-1.2-3-1.2s-2.3.4-3 1.2L3.8 8.2C4.8 7.1 6.3 6.4 8 6.4zM8 3.2c2.5 0 4.8 1 6.4 2.6l-1.2 1.2C11.8 5.6 10 4.8 8 4.8S4.2 5.6 2.8 7L1.6 5.8C3.2 4.2 5.5 3.2 8 3.2z"/>
        </svg>
        {/* Battery */}
        <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
          <rect x="0" y="0.5" width="23" height="11" rx="2.5" stroke="currentColor" strokeWidth="1" />
          <rect x="24.5" y="3.5" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.4" />
          <rect x="2" y="2.5" width="19" height="7" rx="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
