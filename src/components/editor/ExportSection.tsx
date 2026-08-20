'use client';

import React, { useState } from 'react';
import { Download, Film, Image as ImageIcon, Play } from 'lucide-react';
import styles from '@/styles/editor.module.css';
import { useChatStore } from '@/hooks/useChatStore';
import { clamp } from '@/lib/utils';
import { exportPng } from '@/lib/exportPng';
import { exportVideo, previewVideo } from '@/lib/exportVideo';

export function ExportSection() {
  const exportSettings = useChatStore((s) => s.exportSettings);
  const setExportSettings = useChatStore((s) => s.setExportSettings);
  const messages = useChatStore((s) => s.messages);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const addMessage = useChatStore((s) => s.addMessage);
  const setMessages = useChatStore((s) => s.setMessages);
  const setTypingMessage = useChatStore((s) => s.setTypingMessage);
  const setActiveLightboxMessageId = useChatStore((s) => s.setActiveLightboxMessageId);
  const setPlayingMessageId = useChatStore((s) => s.setPlayingMessageId);
  const setPlayingMessageProgress = useChatStore((s) => s.setPlayingMessageProgress);

  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { format, resolution, typingDuration, messageDelay } = exportSettings;
  const isVideo = format === 'webm' || format === 'mp4';
  const isBusy = isExporting || isPreviewing;

  const playbackOptions = {
    messages,
    settings: exportSettings,
    onProgress: (p: number) => setProgress(p),
    elementId: 'whatsapp-preview',
    clearMessages,
    addMessage,
    setMessages,
    setTypingMessage,
    setActiveLightboxMessageId,
    setPlayingMessageId,
    setPlayingMessageProgress,
  };

  const handlePreview = async () => {
    if (isBusy || !isVideo) return;
    setIsPreviewing(true);
    setProgress(0);

    try {
      await previewVideo(playbackOptions);
      await new Promise((r) => setTimeout(r, 200));
    } catch (err: unknown) {
      console.error('Preview failed:', err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`Preview failed: ${message}`);
    } finally {
      setIsPreviewing(false);
      setProgress(0);
    }
  };

  const handleExport = async () => {
    if (isBusy) return;
    setIsExporting(true);
    setProgress(0);

    try {
      if (format === 'png') {
        setProgress(20);
        await exportPng('whatsapp-preview', resolution, 'whatsapp-chat.png');
        setProgress(100);
        await new Promise((r) => setTimeout(r, 400));
      } else {
        await exportVideo(playbackOptions);
      }
    } catch (err: unknown) {
      console.error('Export failed:', err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`Export failed: ${message}`);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };


  return (
    <>
      {/* ── Format ────────────────────────────────────────── */}
      <div>
        <label className={styles.label}>Format</label>
        <div className={styles.choiceButtonGroup} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <button
            className={`${styles.choiceButton} ${
              format === 'mp4' ? styles.choiceButtonActive : ''
            }`}
            onClick={() => setExportSettings({ format: 'mp4' })}
          >
            <Film size={14} />
            MP4 Video
          </button>
          <button
            className={`${styles.choiceButton} ${
              format === 'webm' ? styles.choiceButtonActive : ''
            }`}
            onClick={() => setExportSettings({ format: 'webm' })}
          >
            <Film size={14} />
            WebM Video
          </button>
          <button
            className={`${styles.choiceButton} ${
              format === 'png' ? styles.choiceButtonActive : ''
            }`}
            onClick={() => setExportSettings({ format: 'png' })}
          >
            <ImageIcon size={14} />
            PNG Screen
          </button>
        </div>
      </div>

      {/* ── Resolution ────────────────────────────────────── */}
      <div>
        <label className={styles.label}>Resolution</label>
        <div className={styles.segmentedControl}>
          {([1, 2, 3] as const).map((res) => (
            <button
              key={res}
              className={`${styles.segmentedButton} ${
                resolution === res ? styles.segmentedButtonActive : ''
              }`}
              onClick={() => setExportSettings({ resolution: res })}
            >
              {res}x
            </button>
          ))}
        </div>
        <span className={styles.helperText} style={{ marginTop: 'var(--space-1)' }}>
          {resolution === 1
            ? '375 × 812'
            : resolution === 2
            ? '750 × 1624'
            : '1125 × 2436'}{' '}
          pixels
        </span>
      </div>

      {/* Video settings for WebM export */}
      {isVideo && (
        <>
          <div className={styles.sectionDivider} />

          {/* Typing duration */}
          <div className={styles.fieldGroup}>
            <div className={styles.bubbleEditorRowSpaced}>
              <label className={styles.label} style={{ marginBottom: 0 }}>
                Typing Duration
              </label>
              <span className={styles.helperText}>{typingDuration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={typingDuration}
              onChange={(e) =>
                setExportSettings({
                  typingDuration: clamp(parseFloat(e.target.value), 0.5, 3),
                })
              }
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          {/* Message delay */}
          <div className={styles.fieldGroup}>
            <div className={styles.bubbleEditorRowSpaced}>
              <label className={styles.label} style={{ marginBottom: 0 }}>
                Message Delay
              </label>
              <span className={styles.helperText}>{messageDelay.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.1"
              value={messageDelay}
              onChange={(e) =>
                setExportSettings({
                  messageDelay: clamp(parseFloat(e.target.value), 0.3, 3),
                })
              }
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>
        </>
      )}

      <div className={styles.sectionDivider} />

      {/* ── Progress Bar ──────────────────────────────────── */}
      {isBusy && (
        <div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressLabel}>
            {isPreviewing ? 'Previewing' : 'Exporting'}... {progress}%
          </div>
        </div>
      )}

      {/* ── Export Button ─────────────────────────────────── */}
      <div className={styles.exportActions}>
        {isVideo && (
          <button
            className={styles.previewButton}
            onClick={handlePreview}
            disabled={isBusy}
            type="button"
          >
            <Play size={18} />
            {isPreviewing ? 'Previewing...' : 'Preview Video'}
          </button>
        )}
        <button
          className={styles.exportButton}
          onClick={handleExport}
          disabled={isBusy}
          type="button"
        >
          <Download size={20} />
          {isExporting
            ? 'Exporting...'
            : format === 'png'
            ? 'Download Screenshot'
            : 'Export WebM Video'}
        </button>
      </div>
    </>
  );
}
