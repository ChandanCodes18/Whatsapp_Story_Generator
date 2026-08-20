'use client';

import { create } from 'zustand';
import type { ChatStore, EditorSection, Message } from '@/lib/types';
import { DEFAULT_MESSAGES, DEFAULT_GROUP_MEMBERS, DEFAULT_EXPORT_SETTINGS } from '@/lib/constants';
import { generateId, formatTime } from '@/lib/utils';

export const useChatStore = create<ChatStore>((set) => ({
  // Current User (Me) profile
  currentUser: {
    id: 'me',
    name: 'You',
    avatar: null,
  },

  // Contact
  contactName: 'Maya',
  contactAvatar: null,
  contactStatus: '',
  isVerified: false,

  // Chat settings
  chatMode: 'private',
  groupName: 'Friends Group',
  groupAvatar: null,
  groupMembers: DEFAULT_GROUP_MEMBERS,
  theme: 'light',
  editorTheme: 'light',
  showTimestamps: true,
  showReadReceipts: true,
  wallpaperStyle: 'default',
  wallpaperColor: '#ECE5DD',

  // Messages
  messages: DEFAULT_MESSAGES,
  typingMessage: null,
  activeLightboxMessageId: null,
  playingMessageId: null,
  playingMessageProgress: 0,

  // Export settings
  exportSettings: DEFAULT_EXPORT_SETTINGS,

  // Expanded sections
  expandedSections: new Set<EditorSection>(['create', 'contact', 'messages']),

  // Current User actions
  setCurrentUserName: (name) =>
    set((state) => {
      const updatedMessages = state.messages.map((m) =>
        m.senderId === 'me' ? { ...m, senderName: name } : m
      );
      return {
        currentUser: { ...state.currentUser, name },
        messages: updatedMessages,
      };
    }),
  setCurrentUserAvatar: (avatar) =>
    set((state) => {
      const updatedMessages = state.messages.map((m) =>
        m.senderId === 'me' ? { ...m, senderAvatar: avatar } : m
      );
      return {
        currentUser: { ...state.currentUser, avatar },
        messages: updatedMessages,
      };
    }),

  // Contact actions
  setContactName: (name) =>
    set((state) => {
      const updatedMessages =
        state.chatMode === 'private'
          ? state.messages.map((m) =>
              m.senderId === 'them' ? { ...m, senderName: name } : m
            )
          : state.messages;
      return { contactName: name, messages: updatedMessages };
    }),
  setContactAvatar: (avatar) =>
    set((state) => {
      const updatedMessages =
        state.chatMode === 'private'
          ? state.messages.map((m) =>
              m.senderId === 'them' ? { ...m, senderAvatar: avatar } : m
            )
          : state.messages;
      return { contactAvatar: avatar, messages: updatedMessages };
    }),
  setContactStatus: (status) => set({ contactStatus: status }),
  setIsVerified: (verified) => set({ isVerified: verified }),

  // Chat mode actions
  setChatMode: (mode) => set({ chatMode: mode }),
  setGroupName: (name) => set({ groupName: name }),
  setGroupAvatar: (avatar) => set({ groupAvatar: avatar }),

  addGroupMember: (member) =>
    set((state) => ({
      groupMembers: [
        ...state.groupMembers,
        {
          ...member,
          id: generateId('gm'),
        },
      ],
    })),

  updateGroupMember: (id, updates) =>
    set((state) => {
      const updatedMembers = state.groupMembers.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
      const member = updatedMembers.find((m) => m.id === id);
      const updatedMessages = state.messages.map((m) => {
        if (m.senderId === id && member) {
          return {
            ...m,
            senderName: member.name,
            senderAvatar: member.avatar,
          };
        }
        return m;
      });
      return {
        groupMembers: updatedMembers,
        messages: updatedMessages,
      };
    }),

  removeGroupMember: (id) =>
    set((state) => ({
      groupMembers: state.groupMembers.filter((m) => m.id !== id),
    })),

  // Theme / settings
  setTheme: (theme) => set({ theme }),
  setEditorTheme: (editorTheme) => {
    set({ editorTheme });
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', editorTheme === 'dark');
      localStorage.setItem('editor-theme', editorTheme);
    }
  },
  setShowTimestamps: (show) => set({ showTimestamps: show }),
  setShowReadReceipts: (show) => set({ showReadReceipts: show }),
  setWallpaperStyle: (style) => set({ wallpaperStyle: style }),
  setWallpaperColor: (color) => set({ wallpaperColor: color }),

  // Message actions
  addMessage: (msg) =>
    set((state) => {
      const m = msg as any;
      const isSystemEvent = m.type === 'system_event';

      // Instantly trigger WhatsApp chime sound in the browser for non-system bubbles
      if (!isSystemEvent && typeof window !== 'undefined' && !(window as any).isExportingVideo) {
        try {
          const audio = new Audio('/sfx/ping.mp3');
          audio.volume = 0.55;
          audio.play().catch(() => {
            // Fallback to oscillator chime if file fails to play
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
            gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.015);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          });
        } catch (e) {
          console.warn('Alert sound failed to trigger:', e);
        }
      }
      
      let senderId = m.senderId || m.sender || 'me';
      let senderName = m.senderName || 'You';
      let senderAvatar = m.senderAvatar || null;

      if (!isSystemEvent) {
        if (senderId === 'me') {
          senderName = state.currentUser.name;
          senderAvatar = state.currentUser.avatar;
        } else if (senderId === 'them') {
          if (state.chatMode === 'private') {
            senderName = state.contactName;
            senderAvatar = state.contactAvatar;
          } else if (m.groupMemberId) {
            const member = state.groupMembers.find((gm) => gm.id === m.groupMemberId);
            senderId = m.groupMemberId;
            senderName = member?.name || state.contactName;
            senderAvatar = member?.avatar || null;
          } else {
            senderName = state.contactName;
            senderAvatar = state.contactAvatar;
          }
        } else {
          const member = state.groupMembers.find((gm) => gm.id === senderId);
          if (member) {
            senderName = member.name;
            senderAvatar = member.avatar;
          }
        }
      }

      const nextMessage: Message = isSystemEvent
        ? {
            id: m.id || generateId('msg'),
            text: m.text || '',
            sender: 'them',
            timestamp: m.timestamp || formatTime(),
            status: 'read',
            type: 'system_event',
            replyTo: m.replyTo,
            reactions: m.reactions,
            systemEvent: m.systemEvent || { eventSubtype: 'custom' },
            senderId: 'system',
            senderName: 'System',
            senderAvatar: null,
          }
        : {
            id: m.id || generateId('msg'),
            text: m.text || '',
            sender: (senderId === 'me' ? 'me' : 'them') as 'me' | 'them',
            groupMemberId: senderId === 'me' ? undefined : senderId,
            timestamp: m.timestamp || formatTime(),
            status: m.status || 'read',
            type: m.type && m.type !== 'system_event' ? m.type : 'text',
            replyTo: m.replyTo,
            reactions: m.reactions,
            senderId,
            senderName,
            senderAvatar,
            mediaUrl: m.mediaUrl || null,
            mediaCaption: m.mediaCaption,
            duration: m.duration,
            callType: m.callType,
            callStatus: m.callStatus,
          };

      return {
        messages: [...state.messages, nextMessage],
      };
    }),

  setActiveLightboxMessageId: (id) => set({ activeLightboxMessageId: id }),
  setPlayingMessageId: (id) => set({ playingMessageId: id }),
  setPlayingMessageProgress: (progress) => set({ playingMessageProgress: progress }),

  setMessages: (messages) => set({ messages }),

  setTypingMessage: (typingMessage) => set({ typingMessage }),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id !== id) return m;
        if (m.type === 'system_event') {
          const updatedSystemEvent =
            'systemEvent' in updates ? updates.systemEvent : undefined;

          return {
            ...m,
            ...updates,
            type: 'system_event',
            sender: 'them',
            status: 'read',
            groupMemberId: undefined,
            systemEvent: updatedSystemEvent || m.systemEvent,
          } as Message;
        }

        return {
          ...m,
          ...updates,
          type: updates.type && updates.type !== 'system_event' ? updates.type : m.type,
        } as Message;
      }),
    })),

  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  moveMessageUp: (id) =>
    set((state) => {
      const idx = state.messages.findIndex((m) => m.id === id);
      if (idx <= 0) return state;
      const newMessages = [...state.messages];
      [newMessages[idx - 1], newMessages[idx]] = [newMessages[idx], newMessages[idx - 1]];
      return { messages: newMessages };
    }),

  moveMessageDown: (id) =>
    set((state) => {
      const idx = state.messages.findIndex((m) => m.id === id);
      if (idx === -1 || idx >= state.messages.length - 1) return state;
      const newMessages = [...state.messages];
      [newMessages[idx], newMessages[idx + 1]] = [newMessages[idx + 1], newMessages[idx]];
      return { messages: newMessages };
    }),

  clearMessages: () => set({ messages: [] }),

  setExportSettings: (settings) =>
    set((state) => ({
      exportSettings: { ...state.exportSettings, ...settings },
    })),

  toggleSection: (section) =>
    set((state) => {
      const newSections = new Set(state.expandedSections);
      if (newSections.has(section)) {
        newSections.delete(section);
      } else {
        newSections.add(section);
      }
      return { expandedSections: newSections };
    }),
}));
