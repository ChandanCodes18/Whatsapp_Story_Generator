export type MessageSender = 'me' | 'them';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType =
  | 'text'
  | 'photo'
  | 'video'
  | 'audio'
  | 'call'
  | 'deleted'
  | 'system_event';

export type SystemEventSubtype =
  | 'custom'
  | 'date_divider'
  | 'participant_added'
  | 'participant_left'
  | 'participant_removed'
  | 'group_renamed'
  | 'group_created';

interface BaseMessage {
  id: string;
  text: string;
  timestamp: string;
  replyTo?: string;
  /** Emoji reactions */
  reactions?: string[];
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
}

export interface RegularMessage extends BaseMessage {
  sender: MessageSender;
  /** For group chats, which group member sent the message */
  groupMemberId?: string;
  status: MessageStatus;
  type: Exclude<MessageType, 'system_event'>;

  // Media / Call specific properties
  mediaUrl?: string | null;
  mediaCaption?: string;
  duration?: string;
  callType?: 'voice' | 'video';
  callStatus?: 'answered' | 'missed' | 'outgoing';
}

export interface SystemEventMessage extends BaseMessage {
  type: 'system_event';
  sender: 'them';
  status: 'read';
  groupMemberId?: undefined;
  systemEvent: {
    eventSubtype: SystemEventSubtype;
  };
}

export type Message = RegularMessage | SystemEventMessage;
export type MessageInput = Partial<RegularMessage> | Partial<SystemEventMessage>;

export interface GroupMember {
  id: string;
  name: string;
  avatar: string | null;
  color: string;
}

export interface ContactInfo {
  name: string;
  avatar: string | null;
  status: string;
  isVerified: boolean;
}

export interface ChatSettings {
  chatMode: 'private' | 'group';
  groupName: string;
  groupAvatar: string | null;
  /** WhatsApp preview theme */
  theme: 'light' | 'dark';
  /** Editor UI theme */
  editorTheme: 'light' | 'dark';
  showTimestamps: boolean;
  showReadReceipts: boolean;
  wallpaperStyle: 'default' | 'solid' | 'none';
  wallpaperColor: string;
}

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'png';
  resolution: 1 | 2 | 3;
  /** Video-specific settings */
  typingDuration: number; // seconds per typing indicator
  messageDelay: number; // seconds between messages
  videoWidth: number;
  videoHeight: number;
}

export type EditorSection = 'create' | 'contact' | 'messages' | 'settings' | 'export';

export interface ChatStore {
  // Current User (Me) profile
  currentUser: {
    id: string;
    name: string;
    avatar: string | null;
  };

  // Contact
  contactName: string;
  contactAvatar: string | null;
  contactStatus: string;
  isVerified: boolean;

  // Chat settings
  chatMode: 'private' | 'group';
  groupName: string;
  groupAvatar: string | null;
  groupMembers: GroupMember[];
  theme: 'light' | 'dark';
  editorTheme: 'light' | 'dark';
  showTimestamps: boolean;
  showReadReceipts: boolean;
  wallpaperStyle: 'default' | 'solid' | 'none';
  wallpaperColor: string;

  // Messages
  messages: Message[];
  typingMessage: Message | null;
  activeLightboxMessageId: string | null;
  playingMessageId: string | null;
  playingMessageProgress: number;

  // Export settings
  exportSettings: ExportSettings;

  // Expanded sections
  expandedSections: Set<EditorSection>;

  // Actions
  setCurrentUserName: (name: string) => void;
  setCurrentUserAvatar: (avatar: string | null) => void;

  setContactName: (name: string) => void;
  setContactAvatar: (avatar: string | null) => void;
  setContactStatus: (status: string) => void;
  setIsVerified: (verified: boolean) => void;

  setChatMode: (mode: 'private' | 'group') => void;
  setGroupName: (name: string) => void;
  setGroupAvatar: (avatar: string | null) => void;
  addGroupMember: (member: Omit<GroupMember, 'id'>) => void;
  updateGroupMember: (id: string, updates: Partial<GroupMember>) => void;
  removeGroupMember: (id: string) => void;

  setTheme: (theme: 'light' | 'dark') => void;
  setEditorTheme: (theme: 'light' | 'dark') => void;
  setShowTimestamps: (show: boolean) => void;
  setShowReadReceipts: (show: boolean) => void;
  setWallpaperStyle: (style: 'default' | 'solid' | 'none') => void;
  setWallpaperColor: (color: string) => void;

  addMessage: (msg: MessageInput) => void;
  setActiveLightboxMessageId: (id: string | null) => void;
  setPlayingMessageId: (id: string | null) => void;
  setPlayingMessageProgress: (progress: number) => void;
  setMessages: (messages: Message[]) => void;
  setTypingMessage: (message: Message | null) => void;
  updateMessage: (id: string, updates: MessageInput) => void;
  deleteMessage: (id: string) => void;
  moveMessageUp: (id: string) => void;
  moveMessageDown: (id: string) => void;
  clearMessages: () => void;

  setExportSettings: (settings: Partial<ExportSettings>) => void;
  toggleSection: (section: EditorSection) => void;
}

export interface TimelineMediaMetadata {
  durationMs: number;
  startTimeMs: number;
}

export type TimelineMessage = Message & {
  timeline: TimelineMediaMetadata;
};

export interface AudioCue {
  type: 'sfx' | 'voice_note';
  triggerTimeMs: number;
  audioUrl: string;
  durationMs?: number;
}
