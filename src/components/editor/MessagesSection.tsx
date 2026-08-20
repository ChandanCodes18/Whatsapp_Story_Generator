'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquareOff, Plus, Sparkles, Trash2 } from 'lucide-react';
import styles from '@/styles/editor.module.css';
import { useChatStore } from '@/hooks/useChatStore';
import { MessageBubbleEditor } from './MessageBubbleEditor';
import { SystemEventCreator } from './SystemEventCreator';
import { formatTime, readFileAsDataUrl } from '@/lib/utils';

export function MessagesSection() {
  const messages = useChatStore((s) => s.messages);
  const chatMode = useChatStore((s) => s.chatMode);
  const contactName = useChatStore((s) => s.contactName);
  const groupMembers = useChatStore((s) => s.groupMembers);
  const addMessage = useChatStore((s) => s.addMessage);
  const clearMessages = useChatStore((s) => s.clearMessages);

  // Message Creator state
  const [senderId, setSenderId] = useState<'me' | 'them' | string>('me');
  const [msgType, setMsgType] = useState<'text' | 'photo' | 'video' | 'audio' | 'call' | 'deleted'>('text');
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [duration, setDuration] = useState('0:10');
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [callStatus, setCallStatus] = useState<'answered' | 'missed' | 'outgoing'>('answered');
  const [timestamp, setTimestamp] = useState('');
  const [status, setStatus] = useState<'sent' | 'delivered' | 'read'>('read');

  // Initialize timestamp on client side
  useEffect(() => {
    setTimestamp(formatTime());
  }, []);

  const handleCreateMessage = () => {
    const finalTimestamp = timestamp.trim() || formatTime();
    const isMe = senderId === 'me';
    
    // Resolve defaults for deleted messages
    const defaultText = msgType === 'deleted' 
      ? (isMe ? 'You deleted this message' : 'This message was deleted') 
      : text;

    const newMsg: any = {
      type: msgType,
      text: defaultText,
      timestamp: finalTimestamp,
      status: isMe ? status : 'read',
      senderId: senderId,
      sender: isMe ? 'me' : 'them',
    };

    if (!isMe) {
      if (chatMode === 'group') {
        newMsg.groupMemberId = senderId;
      } else {
        newMsg.senderId = 'them';
      }
    }

    if (msgType === 'photo') {
      newMsg.mediaUrl = mediaUrl;
      newMsg.mediaCaption = mediaCaption;
    } else if (msgType === 'video') {
      newMsg.mediaUrl = mediaUrl;
      newMsg.mediaCaption = mediaCaption;
      newMsg.duration = duration;
    } else if (msgType === 'audio') {
      newMsg.duration = duration;
    } else if (msgType === 'call') {
      newMsg.callType = callType;
      newMsg.callStatus = callStatus;
    }

    addMessage(newMsg);

    // Reset some inputs after adding
    setText('');
    setMediaUrl(null);
    setMediaCaption('');
    setTimestamp(formatTime());
  };

  return (
    <div className={styles.sectionStack}>
      <div className={styles.bubbleEditorRowSpaced}>
        <div className={styles.bubbleEditorRow}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--foreground)' }}>
            Messages
          </span>
          <span className={styles.badge}>{messages.length}</span>
        </div>
        {messages.length > 0 && (
          <button className={styles.clearButton} onClick={clearMessages}>
            <Trash2 size={12} />
            Clear all
          </button>
        )}
      </div>

      {messages.length > 0 ? (
        <div className={styles.messageList}>
          {messages.map((msg, index) => (
            <MessageBubbleEditor
              key={msg.id}
              message={msg}
              index={index}
              total={messages.length}
            />
          ))}
        </div>
      ) : (
        <div className={styles.messageListEmpty}>
          <span className={styles.messageListEmptyIcon}>
            <MessageSquareOff size={32} />
          </span>
          <span className={styles.messageListEmptyText}>No messages yet</span>
          <span className={styles.helperText}>
            Add a message or a system event to start building your chat
          </span>
        </div>
      )}

      <SystemEventCreator />

      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeading}>
          <div className={styles.sectionHeadingContent}>
            <div className={styles.sectionTitle}>Message Creator</div>
            <p className={styles.sectionSubtitle}>
              Configure and add a custom chat bubble to the thread.
            </p>
          </div>
          <div className={styles.sectionIconBadge}>
            <Sparkles size={16} />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Sender</label>
          <select
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            className={styles.compactSelect}
          >
            <option value="me">You (Me)</option>
            {chatMode === 'private' ? (
              <option value="them">{contactName} (Contact)</option>
            ) : (
              groupMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Message Type</label>
          <select
            value={msgType}
            onChange={(e) => {
              setMsgType(e.target.value as any);
              setMediaUrl(null);
              setMediaCaption('');
            }}
            className={styles.compactSelect}
          >
            <option value="text">Text Message</option>
            <option value="photo">Photo Message</option>
            <option value="video">Video Message</option>
            <option value="audio">Voice Note</option>
            <option value="call">Call Log</option>
            <option value="deleted">Deleted Message</option>
          </select>
        </div>

        {/* Dynamic Fields */}
        {msgType === 'text' && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Message Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type message content..."
              className={styles.textarea}
              rows={2}
            />
          </div>
        )}

        {(msgType === 'photo' || msgType === 'video') && (
          <>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                {msgType === 'photo' ? 'Upload Image' : 'Upload Video Thumbnail'}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const dataUrl = await readFileAsDataUrl(file);
                      setMediaUrl(dataUrl);
                    }
                  }}
                  style={{ display: 'none' }}
                  id="creator-media-upload"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('creator-media-upload')?.click()}
                  className={styles.quickAddButton}
                  style={{ width: 'auto', padding: '0 12px', height: '34px', display: 'flex', gap: '6px', alignItems: 'center' }}
                >
                  Select File
                </button>
                {mediaUrl && (
                  <span style={{ fontSize: '11px', color: '#00a884', fontWeight: 600 }}>
                    Loaded ✓
                  </span>
                )}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Caption (Optional)</label>
              <textarea
                value={mediaCaption}
                onChange={(e) => setMediaCaption(e.target.value)}
                placeholder="Type caption..."
                className={styles.textarea}
                rows={1}
              />
            </div>

            {msgType === 'video' && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="0:15"
                  className={styles.input}
                />
              </div>
            )}
          </>
        )}

        {msgType === 'audio' && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0:07"
              className={styles.input}
            />
          </div>
        )}

        {msgType === 'call' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className={styles.fieldGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Call Type</label>
              <select
                value={callType}
                onChange={(e) => setCallType(e.target.value as any)}
                className={styles.compactSelect}
              >
                <option value="voice">Voice Call</option>
                <option value="video">Video Call</option>
              </select>
            </div>
            <div className={styles.fieldGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Call Status</label>
              <select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value as any)}
                className={styles.compactSelect}
              >
                <option value="answered">Incoming Answered</option>
                <option value="missed">Incoming Missed</option>
                <option value="outgoing">Outgoing</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className={styles.fieldGroup} style={{ flex: 1 }}>
            <label className={styles.label}>Timestamp</label>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="10:30 AM"
              className={styles.input}
            />
          </div>
          {senderId === 'me' && msgType !== 'deleted' && (
            <div className={styles.fieldGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Receipt Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={styles.compactSelect}
              >
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
              </select>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleCreateMessage}
          className={styles.primaryActionButton}
          style={{ width: '100%', marginTop: '8px' }}
        >
          Add Message
        </button>
      </div>
    </div>
  );
}
