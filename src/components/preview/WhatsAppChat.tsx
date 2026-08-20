'use client';

import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import styles from '@/styles/preview.module.css';
import { useChatStore } from '@/hooks/useChatStore';
import { ChatHeader } from './ChatHeader';
import { MessageFeedItem } from './MessageFeedItem';
import { ChatInputBar } from './ChatInputBar';
import { TypingIndicator } from './TypingIndicator';
import { StatusBar } from './StatusBar';

export function WhatsAppChat() {
  const {
    messages,
    contactName,
    contactAvatar,
    contactStatus,
    isVerified,
    chatMode,
    groupName,
    groupAvatar,
    groupMembers,
    theme,
    showTimestamps,
    showReadReceipts,
    wallpaperStyle,
    wallpaperColor,
    typingMessage,
    activeLightboxMessageId,
    setActiveLightboxMessageId,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [exportScrollTop, setExportScrollTop] = useState(0);

  const isExporting = typeof window !== 'undefined' && (window as any).isExportingVideo;

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // Auto-scroll to bottom when messages change.
  // During video export, calculate exact scroll offset for CSS transform
  // instead of relying on native scroll which html-to-image often drops.
  useIsomorphicLayoutEffect(() => {
    if (isExporting) {
      if (chatAreaRef.current) {
        const chatArea = chatAreaRef.current;
        const scrollHeight = chatArea.scrollHeight;
        const clientHeight = chatArea.clientHeight;
        setExportScrollTop(Math.max(0, scrollHeight - clientHeight));
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingMessage, isExporting]);

  const isDark = theme === 'dark';
  const displayName = chatMode === 'group' ? groupName : contactName;

  const getGroupMemberName = (memberId?: string) => {
    if (!memberId) return contactName;
    const member = groupMembers.find((m) => m.id === memberId);
    return member?.name || contactName;
  };

  const getGroupMemberColor = (memberId?: string) => {
    if (!memberId) return '#075E54';
    const member = groupMembers.find((m) => m.id === memberId);
    return member?.color || '#075E54';
  };

  const wallpaperClassName = [
    styles.chatWallpaper,
    isDark ? styles.chatWallpaperDark : '',
  ].filter(Boolean).join(' ');

  const wallpaperBg = wallpaperStyle === 'solid'
    ? { backgroundColor: wallpaperColor, backgroundImage: 'none' }
    : wallpaperStyle === 'none'
    ? { backgroundColor: isDark ? '#0B141A' : '#FFFFFF', backgroundImage: 'none' }
    : undefined;

  const activeLightboxMessage = messages.find((m) => m.id === activeLightboxMessageId);

  return (
    <div
      className={`${styles.chatContainer} ${isDark ? styles.chatContainerDark : ''}`}
      id="whatsapp-preview"
    >
      <StatusBar isDark={isDark} />
      <ChatHeader
        name={displayName}
        avatar={chatMode === 'group' ? groupAvatar : contactAvatar}
        status={contactStatus}
        isVerified={isVerified}
        isDark={isDark}
        isGroup={chatMode === 'group'}
        memberCount={chatMode === 'group' ? groupMembers.length + 1 : undefined}
      />
      <div
        ref={chatAreaRef}
        className={wallpaperClassName}
        style={{
          ...wallpaperBg,
          ...(isExporting ? { overflowY: 'hidden' } : {})
        }}
      >
        <div 
          className={styles.messageArea}
          style={isExporting ? { transform: `translateY(-${exportScrollTop}px)`, transition: 'none' } : undefined}
        >
          {messages.map((msg, index) => (
            <MessageFeedItem
              key={msg.id}
              message={msg}
              isDark={isDark}
              showTimestamp={showTimestamps}
              showReadReceipt={showReadReceipts}
              senderName={
                chatMode === 'group' &&
                msg.sender === 'them' &&
                msg.type !== 'system_event'
                  ? getGroupMemberName(msg.groupMemberId)
                  : undefined
              }
              senderColor={
                chatMode === 'group' &&
                msg.sender === 'them' &&
                msg.type !== 'system_event'
                  ? getGroupMemberColor(msg.groupMemberId)
                  : undefined
              }
              isFirstFromSender={
                msg.type === 'system_event' ||
                index === 0 ||
                messages[index - 1].sender !== msg.sender ||
                messages[index - 1].groupMemberId !== msg.groupMemberId
              }
            />
          ))}
          {typingMessage && (
            <TypingIndicator
              isDark={isDark}
              sender={typingMessage.sender}
              senderName={
                chatMode === 'group' && typingMessage.sender === 'them'
                  ? getGroupMemberName(typingMessage.groupMemberId)
                  : undefined
              }
              senderColor={
                chatMode === 'group' && typingMessage.sender === 'them'
                  ? getGroupMemberColor(typingMessage.groupMemberId)
                  : undefined
              }
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInputBar isDark={isDark} />

      {/* Fullscreen Photo Lightbox Modal Overlay */}
      {activeLightboxMessage && activeLightboxMessage.type === 'photo' && activeLightboxMessage.mediaUrl && (
        <div
          onClick={() => setActiveLightboxMessageId(null)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            padding: '24px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              position: 'absolute',
              top: '54px',
              left: 0,
              width: '100%',
              padding: '0 20px',
              display: 'flex',
              flexDirection: 'column',
              color: '#ffffff',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {activeLightboxMessage.senderName}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
              {activeLightboxMessage.timestamp}
            </span>
          </div>

          <img
            src={activeLightboxMessage.mediaUrl}
            alt="Expanded view"
            style={{
              maxWidth: '100%',
              maxHeight: '70%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          />

          {activeLightboxMessage.mediaCaption && (
            <div
              style={{
                marginTop: '16px',
                color: '#ffffff',
                fontSize: '13px',
                textAlign: 'center',
                maxWidth: '90%',
                padding: '8px 16px',
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: '8px',
              }}
            >
              {activeLightboxMessage.mediaCaption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
