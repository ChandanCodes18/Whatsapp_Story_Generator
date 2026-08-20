'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from '@/styles/editor.module.css';
import { useChatStore } from '@/hooks/useChatStore';

export function SettingsSection() {
  const theme = useChatStore((s) => s.theme);
  const showTimestamps = useChatStore((s) => s.showTimestamps);
  const showReadReceipts = useChatStore((s) => s.showReadReceipts);
  const wallpaperStyle = useChatStore((s) => s.wallpaperStyle);
  const wallpaperColor = useChatStore((s) => s.wallpaperColor);

  const setTheme = useChatStore((s) => s.setTheme);
  const setShowTimestamps = useChatStore((s) => s.setShowTimestamps);
  const setShowReadReceipts = useChatStore((s) => s.setShowReadReceipts);
  const setWallpaperStyle = useChatStore((s) => s.setWallpaperStyle);
  const setWallpaperColor = useChatStore((s) => s.setWallpaperColor);

  return (
    <>
      {/* ── WhatsApp Theme (preview only) ─────────────────── */}
      <div>
        <label className={styles.label}>WhatsApp Theme</label>
        <div className={styles.segmentedControl}>
          <button
            className={`${styles.segmentedButton} ${
              theme === 'light' ? styles.segmentedButtonActive : ''
            }`}
            onClick={() => setTheme('light')}
          >
            <Sun size={14} className={styles.segmentedButtonIcon} />
            Light
          </button>
          <button
            className={`${styles.segmentedButton} ${
              theme === 'dark' ? styles.segmentedButtonActive : ''
            }`}
            onClick={() => setTheme('dark')}
          >
            <Moon size={14} className={styles.segmentedButtonIcon} />
            Dark
          </button>
        </div>
      </div>

      <div className={styles.sectionDivider} />

      {/* ── Show Timestamps ───────────────────────────────── */}
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Show timestamps</span>
        <button
          className={`${styles.toggle} ${
            showTimestamps ? styles.toggleActive : ''
          }`}
          onClick={() => setShowTimestamps(!showTimestamps)}
          role="switch"
          aria-checked={showTimestamps}
          type="button"
        />
      </div>

      {/* ── Show Read Receipts ────────────────────────────── */}
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Show read receipts</span>
        <button
          className={`${styles.toggle} ${
            showReadReceipts ? styles.toggleActive : ''
          }`}
          onClick={() => setShowReadReceipts(!showReadReceipts)}
          role="switch"
          aria-checked={showReadReceipts}
          type="button"
        />
      </div>

      <div className={styles.sectionDivider} />

      {/* ── Wallpaper Style ───────────────────────────────── */}
      <div>
        <label className={styles.label}>Wallpaper</label>
        <div className={styles.choiceButtonGroup}>
          <button
            className={`${styles.choiceButton} ${
              wallpaperStyle === 'default' ? styles.choiceButtonActive : ''
            }`}
            onClick={() => setWallpaperStyle('default')}
          >
            Default
          </button>
          <button
            className={`${styles.choiceButton} ${
              wallpaperStyle === 'solid' ? styles.choiceButtonActive : ''
            }`}
            onClick={() => setWallpaperStyle('solid')}
          >
            Solid Color
          </button>
          <button
            className={`${styles.choiceButton} ${
              wallpaperStyle === 'none' ? styles.choiceButtonActive : ''
            }`}
            onClick={() => setWallpaperStyle('none')}
          >
            None
          </button>
        </div>
      </div>

      {/* ── Wallpaper Color (only when solid) ─────────────── */}
      {wallpaperStyle === 'solid' && (
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Wallpaper Color</label>
            <div className={styles.bubbleEditorRow}>
              <input
                type="color"
                value={wallpaperColor}
                onChange={(e) => setWallpaperColor(e.target.value)}
                style={{
                  width: 36,
                  height: 36,
                  padding: 2,
                  border: '1.5px solid var(--input)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--background)',
                }}
              />
              <input
                type="text"
                className={`${styles.input} ${styles.inputSmall}`}
                value={wallpaperColor}
                onChange={(e) => setWallpaperColor(e.target.value)}
                placeholder="#ECE5DD"
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
