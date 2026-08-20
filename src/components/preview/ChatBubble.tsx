'use client';

import React from 'react';
import { Play, Mic } from 'lucide-react';
import styles from '@/styles/preview.module.css';
import type { Message } from '@/lib/types';
import { useChatStore } from '@/hooks/useChatStore';
import { getInitials, getAvatarColor } from '@/lib/utils';

interface ChatBubbleProps {
  message: Message;
  isDark: boolean;
  showTimestamp: boolean;
  showReadReceipt: boolean;
  senderName?: string;
  senderColor?: string;
  isFirstFromSender: boolean;
}

function ReadReceipt({ status, isDark }: { status: Message['status']; isDark: boolean }) {
  if (status === 'sent') {
    return (
      <svg className={styles.statusIcon} viewBox="0 0 16 11" width="16" height="11">
        <path
          d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.343.153l-.568.601a.482.482 0 0 0 0 .684l3.037 3.155c.092.089.204.14.327.14h.046c.131 0 .254-.064.351-.178l7.012-8.634a.504.504 0 0 0-.005-.672l-.635-.713z"
          fill={isDark ? '#8696A0' : '#8696A0'}
        />
      </svg>
    );
  }

  const color = status === 'read'
    ? '#53BDEB'
    : (isDark ? '#8696A0' : '#8696A0');

  return (
    <svg className={styles.statusIcon} viewBox="0 0 16 11" width="16" height="11">
      <path
        d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.343.153l-.568.601a.482.482 0 0 0 0 .684l3.037 3.155c.092.089.204.14.327.14h.046c.131 0 .254-.064.351-.178l7.012-8.634a.504.504 0 0 0-.005-.672l-.635-.713z"
        fill={color}
      />
      <path
        d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.353-1.41-.445.469-.171.178 2.016 2.093c.092.089.204.14.327.14h.046c.131 0 .254-.064.351-.178l7.012-8.634a.504.504 0 0 0-.005-.672l-.635-.713-.268-.285z"
        fill={color}
      />
    </svg>
  );
}

const renderTextContent = (
  message: Message,
  isDark: boolean,
  showTimestamp: boolean,
  showReadReceipt: boolean,
  isOutgoing: boolean
) => {
  return (
    <div className={styles.bubbleContent}>
      <span className={styles.bubbleText}>{message.text}</span>
      <span className={`${styles.bubbleMeta} ${isDark ? styles.bubbleMetaDark : ''}`}>
        {showTimestamp && (
          <span className={styles.timestamp}>{message.timestamp}</span>
        )}
        {isOutgoing && showReadReceipt && (
          <ReadReceipt status={message.status} isDark={isDark} />
        )}
      </span>
    </div>
  );
};

const renderPhotoContent = (
  message: Message,
  isDark: boolean,
  showTimestamp: boolean,
  showReadReceipt: boolean,
  isOutgoing: boolean
) => {
  if (message.type === 'system_event') return null;
  const hasCaption = !!message.mediaCaption;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: '-4px -5px' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: hasCaption ? '6px 6px 0 0' : '6px',
          overflow: 'hidden',
          backgroundColor: isDark ? '#182229' : '#f0f2f5',
          minWidth: '200px',
          maxWidth: '300px',
          aspectRatio: '4/3',
        }}
      >
        {message.mediaUrl ? (
          <img
            src={message.mediaUrl}
            alt="Attachment"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#8696a0' : '#667781',
              background: isDark
                ? 'linear-gradient(to bottom, #2a3942, #202c33)'
                : 'linear-gradient(to bottom, #f0f2f5, #e1e4e7)',
              gap: '8px',
            }}
          >
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span style={{ fontSize: '11px', fontWeight: 500 }}>No Image Uploaded</span>
          </div>
        )}

        {!hasCaption && (
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              padding: '2px 6px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              backdropFilter: 'blur(2px)',
            }}
          >
            {showTimestamp && (
              <span style={{ fontSize: '10px', color: '#ffffff' }}>{message.timestamp}</span>
            )}
            {isOutgoing && showReadReceipt && (
              <ReadReceipt status={message.status} isDark={true} />
            )}
          </div>
        )}
      </div>

      {hasCaption && (
        <div
          style={{
            padding: '6px 8px 4px 8px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <span className={styles.bubbleText} style={{ paddingRight: '55px' }}>
            {message.mediaCaption}
          </span>
          <span
            className={`${styles.bubbleMeta} ${isDark ? styles.bubbleMetaDark : ''}`}
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '8px',
              margin: 0,
            }}
          >
            {showTimestamp && (
              <span className={styles.timestamp}>{message.timestamp}</span>
            )}
            {isOutgoing && showReadReceipt && (
              <ReadReceipt status={message.status} isDark={isDark} />
            )}
          </span>
        </div>
      )}
    </div>
  );
};

const renderVideoContent = (
  message: Message,
  isDark: boolean,
  showTimestamp: boolean,
  showReadReceipt: boolean,
  isOutgoing: boolean
) => {
  if (message.type === 'system_event') return null;
  const hasCaption = !!message.mediaCaption;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: '-4px -5px' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: hasCaption ? '6px 6px 0 0' : '6px',
          overflow: 'hidden',
          backgroundColor: isDark ? '#182229' : '#f0f2f5',
          minWidth: '200px',
          maxWidth: '300px',
          aspectRatio: '4/3',
        }}
      >
        {message.mediaUrl ? (
          <img
            src={message.mediaUrl}
            alt="Video Thumbnail"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#8696a0' : '#667781',
              background: isDark
                ? 'linear-gradient(to bottom, #2a3942, #202c33)'
                : 'linear-gradient(to bottom, #f0f2f5, #e1e4e7)',
              gap: '8px',
            }}
          >
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <span style={{ fontSize: '11px', fontWeight: 500 }}>No Video Thumbnail</span>
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(11, 20, 26, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            border: '2px solid #ffffff',
            cursor: 'pointer',
          }}
        >
          <Play size={18} fill="#ffffff" stroke="none" style={{ marginLeft: '2px', color: '#ffffff' }} />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#ffffff',
            fontWeight: 500,
          }}
        >
          {message.duration || '0:15'}
        </div>

        {!hasCaption && (
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              padding: '2px 6px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              backdropFilter: 'blur(2px)',
            }}
          >
            {showTimestamp && (
              <span style={{ fontSize: '10px', color: '#ffffff' }}>{message.timestamp}</span>
            )}
            {isOutgoing && showReadReceipt && (
              <ReadReceipt status={message.status} isDark={true} />
            )}
          </div>
        )}
      </div>

      {hasCaption && (
        <div
          style={{
            padding: '6px 8px 4px 8px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <span className={styles.bubbleText} style={{ paddingRight: '55px' }}>
            {message.mediaCaption}
          </span>
          <span
            className={`${styles.bubbleMeta} ${isDark ? styles.bubbleMetaDark : ''}`}
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '8px',
              margin: 0,
            }}
          >
            {showTimestamp && (
              <span className={styles.timestamp}>{message.timestamp}</span>
            )}
            {isOutgoing && showReadReceipt && (
              <ReadReceipt status={message.status} isDark={isDark} />
            )}
          </span>
        </div>
      )}
    </div>
  );
};

const renderAudioContent = (
  message: Message,
  isDark: boolean,
  showTimestamp: boolean,
  showReadReceipt: boolean,
  isOutgoing: boolean,
  playingMessageId: string | null,
  playingProgress: number
) => {
  if (message.type === 'system_event') return null;
  const waveBars = [8, 14, 6, 20, 12, 18, 10, 24, 16, 8, 22, 14, 10, 16, 6];
  
  const isPlayingThis = playingMessageId === message.id;
  const progressRatio = isPlayingThis ? playingProgress / 100 : 0;
  const activeBarsCount = Math.floor(waveBars.length * progressRatio);

  const activeColor = isOutgoing
    ? (isDark ? '#00a884' : '#25D366')
    : '#53bdeb';
  
  const inactiveColor = isDark ? '#667781' : '#b6bec2';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '230px', padding: '2px 0 0 0' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            color: isDark ? '#e9edef' : '#54656f',
          }}
        >
          {isPlayingThis ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="none">
              <rect x="4" y="4" width="4" height="16" />
              <rect x="16" y="4" width="4" height="16" />
            </svg>
          ) : (
            <Play size={18} fill="currentColor" stroke="none" style={{ marginLeft: '2px' }} />
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, height: '24px' }}>
          {waveBars.map((height, i) => {
            const isActive = i <= activeBarsCount && isPlayingThis;
            return (
              <div
                key={i}
                style={{
                  width: '3px',
                  height: `${height}px`,
                  borderRadius: '1.5px',
                  backgroundColor: isActive ? activeColor : inactiveColor,
                }}
              />
            );
          })}
        </div>

        <div style={{ position: 'relative', flexShrink: 0, width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#2a3942' : '#dfe5e7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8696a0',
            }}
          >
            <Mic size={14} style={{ color: isOutgoing ? '#53bdeb' : '#8696a0' }} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2px',
          paddingLeft: '40px',
          fontSize: '11px',
          color: isDark ? 'rgba(233,237,239,0.45)' : 'rgba(17,27,33,0.45)',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 500 }}>
          {message.duration || '0:07'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {showTimestamp && <span style={{ fontSize: '10px' }}>{message.timestamp}</span>}
          {isOutgoing && showReadReceipt && (
            <ReadReceipt status={message.status} isDark={isDark} />
          )}
        </div>
      </div>
    </div>
  );
};

const renderCallContent = (
  message: Message,
  isDark: boolean,
  showTimestamp: boolean,
  showReadReceipt: boolean,
  isOutgoing: boolean
) => {
  if (message.type === 'system_event') return null;
  const callType = message.callType || 'voice';
  const callStatus = message.callStatus || 'answered';

  const isIncomingMissed = callStatus === 'missed';
  const isCallOutgoing = callStatus === 'outgoing';

  let arrowColor = '#25D366';
  if (isIncomingMissed) {
    arrowColor = '#ea0038';
  } else if (isCallOutgoing) {
    arrowColor = '#8696a0';
  }

  const getCallTitleText = () => {
    if (callType === 'video') {
      return isIncomingMissed ? 'Missed video call' : 'Video call';
    }
    return isIncomingMissed ? 'Missed voice call' : 'Voice call';
  };

  const getCallSubtitleText = () => {
    if (isCallOutgoing) return 'Outgoing';
    if (isIncomingMissed) return 'Missed';
    return 'Incoming';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '170px', padding: '2px 0' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: isDark ? '#e9edef' : '#54656f',
        }}
      >
        {callType === 'video' ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontWeight: 600, fontSize: '13px', color: isDark ? '#e9edef' : '#111b21' }}>
          {getCallTitleText()}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
          <div style={{ display: 'flex', color: arrowColor }}>
            {isCallOutgoing ? (
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="17" y1="7" x2="7" y2="17" />
                <polyline points="17 17 7 17 7 7" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: '11px', color: isDark ? '#8696a0' : '#667781' }}>
            {getCallSubtitleText()}
          </span>
        </div>
      </div>

      <div
        className={`${styles.bubbleMeta} ${isDark ? styles.bubbleMetaDark : ''}`}
        style={{ alignSelf: 'flex-end', margin: '8px 0 -2px 4px' }}
      >
        {showTimestamp && <span style={{ fontSize: '10px' }}>{message.timestamp}</span>}
        {isOutgoing && showReadReceipt && (
          <ReadReceipt status={message.status} isDark={isDark} />
        )}
      </div>
    </div>
  );
};

const renderDeletedContent = (
  message: Message,
  isDark: boolean,
  showTimestamp: boolean,
  showReadReceipt: boolean,
  isOutgoing: boolean
) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', minWidth: '150px' }}>
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ color: isDark ? 'rgba(233,237,239,0.3)' : 'rgba(17,27,33,0.3)', flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
      <span
        style={{
          fontStyle: 'italic',
          color: isDark ? 'rgba(233,237,239,0.45)' : 'rgba(17,27,33,0.45)',
          fontSize: '13px',
          flex: 1,
        }}
      >
        {isOutgoing ? 'You deleted this message' : 'This message was deleted'}
      </span>
      <div
        className={`${styles.bubbleMeta} ${isDark ? styles.bubbleMetaDark : ''}`}
        style={{ alignSelf: 'flex-end', margin: '4px 0 -2px 4px' }}
      >
        {showTimestamp && <span style={{ fontSize: '10px' }}>{message.timestamp}</span>}
      </div>
    </div>
  );
};

const renderBubbleContent = (
  message: Message,
  isDark: boolean,
  showTimestamp: boolean,
  showReadReceipt: boolean,
  isOutgoing: boolean,
  playingMessageId: string | null,
  playingProgress: number
) => {
  if (message.type === 'system_event') return null;

  switch (message.type) {
    case 'photo':
      return renderPhotoContent(message, isDark, showTimestamp, showReadReceipt, isOutgoing);
    case 'video':
      return renderVideoContent(message, isDark, showTimestamp, showReadReceipt, isOutgoing);
    case 'audio':
      return renderAudioContent(
        message,
        isDark,
        showTimestamp,
        showReadReceipt,
        isOutgoing,
        playingMessageId,
        playingProgress
      );
    case 'call':
      return renderCallContent(message, isDark, showTimestamp, showReadReceipt, isOutgoing);
    case 'deleted':
      return renderDeletedContent(message, isDark, showTimestamp, showReadReceipt, isOutgoing);
    case 'text':
    default:
      return renderTextContent(message, isDark, showTimestamp, showReadReceipt, isOutgoing);
  }
};

export function ChatBubble({
  message,
  isDark,
  showTimestamp,
  showReadReceipt,
  senderName,
  senderColor,
  isFirstFromSender,
}: ChatBubbleProps) {
  const isOutgoing = message.senderId === 'me';
  
  const playingMessageId = useChatStore((s) => s.playingMessageId);
  const playingMessageProgress = useChatStore((s) => s.playingMessageProgress);

  const bubbleClasses = [
    styles.bubble,
    isOutgoing ? styles.bubbleOutgoing : styles.bubbleIncoming,
    isDark ? (isOutgoing ? styles.bubbleOutgoingDark : styles.bubbleIncomingDark) : '',
    isFirstFromSender ? styles.bubbleFirst : '',
  ].filter(Boolean).join(' ');

  const rowClasses = [
    styles.bubbleRow,
    isOutgoing ? styles.bubbleRowOutgoing : '',
  ].filter(Boolean).join(' ');

  const avatarInitials = message.senderName ? getInitials(message.senderName) : '?';
  const avatarColorInfo = getAvatarColor(message.senderName || 'O');

  return (
    <div
      className={rowClasses}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        width: '100%',
      }}
    >
      {/* Sender Avatar (Incoming Only) */}
      {!isOutgoing && (
        <div style={{ width: '28px', flexShrink: 0, marginTop: '2px', display: 'flex', justifyContent: 'center' }}>
          {isFirstFromSender ? (
            message.senderAvatar ? (
              <img
                src={message.senderAvatar}
                alt={message.senderName}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: avatarColorInfo.bg,
                  color: avatarColorInfo.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  userSelect: 'none',
                }}
              >
                {avatarInitials}
              </div>
            )
          ) : (
            <div style={{ width: '28px', height: '1px' }} />
          )}
        </div>
      )}

      {/* Bubble Box */}
      <div className={bubbleClasses} style={{ flexGrow: 0, position: 'relative' }}>
        {/* Bubble tail */}
        {isFirstFromSender && (
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
        )}

        {/* Sender Name header inside the bubble */}
        {!isOutgoing && message.senderName && isFirstFromSender && (
          <div
            className={styles.senderName}
            style={{
              color: senderColor || avatarColorInfo.text || '#075E54',
              fontWeight: 600,
              fontSize: '11.5px',
              marginBottom: '3px',
            }}
          >
            {message.senderName}
          </div>
        )}

        {/* Inner Content */}
        {renderBubbleContent(
          message,
          isDark,
          showTimestamp,
          showReadReceipt,
          isOutgoing,
          playingMessageId,
          playingMessageProgress
        )}
      </div>
    </div>
  );
}
