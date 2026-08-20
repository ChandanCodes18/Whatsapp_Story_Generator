'use client';

import React, { useEffect } from 'react';
import styles from '@/styles/editor.module.css';
import phoneStyles from '@/styles/phone.module.css';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { PhoneFrame } from '@/components/preview/PhoneFrame';
import { useChatStore } from '@/hooks/useChatStore';

export default function AppPage() {
  const setEditorTheme = useChatStore((s) => s.setEditorTheme);

  // Initialize theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('editor-theme');
    if (saved === 'dark' || saved === 'light') {
      setEditorTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setEditorTheme('dark');
    }
  }, [setEditorTheme]);

  return (
    <div className={styles.editorLayout}>
      <EditorSidebar />
      <div className={phoneStyles.previewPanel}>
        <PhoneFrame />
      </div>
    </div>
  );
}
