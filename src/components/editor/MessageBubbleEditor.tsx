'use client';

import React from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import styles from '@/styles/editor.module.css';
import { SYSTEM_EVENT_OPTIONS } from '@/lib/constants';
import { useChatStore } from '@/hooks/useChatStore';
import type { Message, MessageStatus, SystemEventSubtype } from '@/lib/types';
import { readFileAsDataUrl } from '@/lib/utils';

interface MessageBubbleEditorProps {
  message: Message;
  index: number;
  total: number;
}

export function MessageBubbleEditor({
  message,
  index,
  total,
}: MessageBubbleEditorProps) {
  const contactName = useChatStore((s) => s.contactName);
  const contactAvatar = useChatStore((s) => s.contactAvatar);
  const chatMode = useChatStore((s) => s.chatMode);
  const groupMembers = useChatStore((s) => s.groupMembers);
  const currentUser = useChatStore((s) => s.currentUser);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const moveMessageUp = useChatStore((s) => s.moveMessageUp);
  const moveMessageDown = useChatStore((s) => s.moveMessageDown);

  const isSystemEvent = message.type === 'system_event';
  const isMe = !isSystemEvent && message.senderId === 'me';
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const getSenderDisplayName = (): string => {
    if (isSystemEvent) return 'System event';
    if (isMe) return 'You';
    if (chatMode === 'group' && message.senderId !== 'me') {
      const member = groupMembers.find((m) => m.id === message.senderId);
      return member?.name || contactName || 'Contact';
    }
    return contactName || 'Contact';
  };

  const handleSenderToggle = () => {
    if (isSystemEvent) return;

    if (chatMode === 'private') {
      if (isMe) {
        // Toggle to contact
        updateMessage(message.id, {
          sender: 'them',
          senderId: 'them',
          senderName: contactName,
          senderAvatar: contactAvatar,
          groupMemberId: undefined,
        });
      } else {
        // Toggle to Me
        updateMessage(message.id, {
          sender: 'me',
          senderId: 'me',
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          groupMemberId: undefined,
        });
      }
      return;
    }

    // Group Mode Toggles
    if (isMe && groupMembers.length > 0) {
      // Toggle to first group member
      const member = groupMembers[0];
      updateMessage(message.id, {
        sender: 'them',
        senderId: member.id,
        senderName: member.name,
        senderAvatar: member.avatar,
        groupMemberId: member.id,
      });
    } else {
      // Find current group member index
      const currentIdx = groupMembers.findIndex((m) => m.id === message.senderId);
      const nextIdx = currentIdx + 1;

      if (currentIdx !== -1 && nextIdx < groupMembers.length) {
        // Toggle to next member
        const member = groupMembers[nextIdx];
        updateMessage(message.id, {
          sender: 'them',
          senderId: member.id,
          senderName: member.name,
          senderAvatar: member.avatar,
          groupMemberId: member.id,
        });
      } else {
        // Toggle to Me
        updateMessage(message.id, {
          sender: 'me',
          senderId: 'me',
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          groupMemberId: undefined,
        });
      }
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const indicatorColor = isSystemEvent
    ? '#25D366'
    : isMe
    ? 'var(--primary, #25D366)'
    : chatMode === 'group'
    ? groupMembers.find((m) => m.id === message.senderId)?.color || 'var(--muted-foreground)'
    : 'var(--muted-foreground)';

  return (
    <div
      className={styles.messageCard}
      style={{ borderLeftColor: indicatorColor, borderLeftWidth: 3 }}
    >
      <div className={styles.reorderButtons}>
        <button
          className={styles.reorderButton}
          onClick={() => moveMessageUp(message.id)}
          disabled={isFirst}
          title="Move up"
        >
          <ChevronUp size={14} />
        </button>
        <div className={styles.reorderButtonDivider} />
        <button
          className={styles.reorderButton}
          onClick={() => moveMessageDown(message.id)}
          disabled={isLast}
          title="Move down"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      <div className={styles.bubbleEditor}>
        <div className={styles.bubbleEditorRowSpaced}>
          <button
            className={`${styles.senderBadge} ${
              isSystemEvent ? styles.senderBadgeSystem : isMe ? styles.senderBadgeYou : styles.senderBadgeOther
            }`}
            onClick={handleSenderToggle}
            title={isSystemEvent ? 'System event' : 'Click to change sender'}
            type="button"
          >
            {getSenderDisplayName()}
          </button>

          {!isSystemEvent && (
            <select
              className={styles.statusSelect}
              value={message.type}
              onChange={(e) =>
                updateMessage(message.id, {
                  type: e.target.value as any,
                  text: e.target.value === 'deleted'
                    ? (isMe ? 'You deleted this message' : 'This message was deleted')
                    : message.text,
                })
              }
            >
              <option value="text">Text</option>
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="call">Call Log</option>
              <option value="deleted">Deleted</option>
            </select>
          )}

          {isSystemEvent && (
            <select
              className={styles.statusSelect}
              value={message.systemEvent.eventSubtype}
              onChange={(e) =>
                updateMessage(message.id, {
                  systemEvent: {
                    eventSubtype: e.target.value as SystemEventSubtype,
                  },
                })
              }
            >
              {SYSTEM_EVENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Dynamic Fields */}
        {!isSystemEvent && message.type === 'text' && (
          <textarea
            className={styles.textarea}
            value={message.text}
            onChange={(e) => updateMessage(message.id, { text: e.target.value })}
            onInput={handleTextareaInput}
            placeholder="Type a message..."
            rows={1}
            style={{ minHeight: '40px' }}
          />
        )}

        {!isSystemEvent && (message.type === 'photo' || message.type === 'video') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const dataUrl = await readFileAsDataUrl(file);
                    updateMessage(message.id, { mediaUrl: dataUrl });
                  }
                }}
                style={{ display: 'none' }}
                id={`bubble-media-upload-${message.id}`}
              />
              <button
                type="button"
                onClick={() => document.getElementById(`bubble-media-upload-${message.id}`)?.click()}
                className={styles.quickAddButton}
                style={{ width: 'auto', padding: '0 8px', height: '28px', fontSize: '11px', display: 'flex', alignItems: 'center' }}
              >
                Change File
              </button>
              {message.mediaUrl && (
                <span style={{ fontSize: '11px', color: '#00a884', fontWeight: 600 }}>Loaded ✓</span>
              )}
            </div>
            <textarea
              className={styles.textarea}
              value={message.mediaCaption || ''}
              onChange={(e) => updateMessage(message.id, { mediaCaption: e.target.value })}
              onInput={handleTextareaInput}
              placeholder="Caption (optional)..."
              rows={1}
              style={{ minHeight: '40px' }}
            />
            {message.type === 'video' && (
              <input
                type="text"
                className={styles.input}
                value={message.duration || ''}
                onChange={(e) => updateMessage(message.id, { duration: e.target.value })}
                placeholder="Duration (e.g. 0:15)"
                style={{ height: '30px', fontSize: '12px' }}
              />
            )}
          </div>
        )}

        {!isSystemEvent && message.type === 'audio' && (
          <input
            type="text"
            className={styles.input}
            value={message.duration || ''}
            onChange={(e) => updateMessage(message.id, { duration: e.target.value })}
            placeholder="Duration (e.g. 0:07)"
            style={{ height: '30px', fontSize: '12px' }}
          />
        )}

        {!isSystemEvent && message.type === 'call' && (
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <select
              className={styles.statusSelect}
              value={message.callType || 'voice'}
              onChange={(e) => updateMessage(message.id, { callType: e.target.value as any })}
              style={{ flex: 1, height: '30px' }}
            >
              <option value="voice">Voice Call</option>
              <option value="video">Video Call</option>
            </select>
            <select
              className={styles.statusSelect}
              value={message.callStatus || 'answered'}
              onChange={(e) => updateMessage(message.id, { callStatus: e.target.value as any })}
              style={{ flex: 1, height: '30px' }}
            >
              <option value="answered">Incoming Answered</option>
              <option value="missed">Incoming Missed</option>
              <option value="outgoing">Outgoing</option>
            </select>
          </div>
        )}

        {!isSystemEvent && message.type === 'deleted' && (
          <div style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--muted-foreground)', padding: '4px 0' }}>
            Deleted messages display standard template text.
          </div>
        )}

        {isSystemEvent && (
          <textarea
            className={styles.textarea}
            value={message.text}
            onChange={(e) => updateMessage(message.id, { text: e.target.value })}
            onInput={handleTextareaInput}
            placeholder="Type a system event..."
            rows={1}
            style={{ minHeight: '40px' }}
          />
        )}

        <div className={styles.bubbleEditorRowSpaced}>
          <div className={styles.bubbleEditorRow}>
            <input
              type="text"
              className={`${styles.input} ${styles.inputSmall}`}
              value={message.timestamp}
              onChange={(e) => updateMessage(message.id, { timestamp: e.target.value })}
              placeholder="10:30 AM"
              style={{ width: '90px', flexShrink: 0 }}
            />

            {!isSystemEvent && isMe && message.type !== 'deleted' && (
              <select
                className={styles.statusSelect}
                value={message.status}
                onChange={(e) =>
                  updateMessage(message.id, {
                    status: e.target.value as MessageStatus,
                  })
                }
              >
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
              </select>
            )}
          </div>

          <button
            className={styles.deleteButton}
            onClick={() => deleteMessage(message.id)}
            title="Delete message"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
