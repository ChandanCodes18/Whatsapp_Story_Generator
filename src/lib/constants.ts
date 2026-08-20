import type {
  ExportSettings,
  GroupMember,
  Message,
  SystemEventSubtype,
} from './types';

/** WhatsApp brand colors */
export const WA_COLORS = {
  // Light theme
  light: {
    headerBg: '#075E54',
    headerText: '#FFFFFF',
    chatBg: '#ECE5DD',
    outgoingBubble: '#DCF8C6',
    incomingBubble: '#FFFFFF',
    bubbleText: '#303030',
    timestampText: '#667781',
    systemBg: '#E2DACC',
    systemText: '#54656F',
    inputBg: '#FFFFFF',
    teal: '#075E54',
    tealDark: '#054D44',
    green: '#25D366',
    blue: '#34B7F1',
    readTick: '#53BDEB',
    greyTick: '#8696A0',
  },
  // Dark theme
  dark: {
    headerBg: '#1F2C34',
    headerText: '#E9EDEF',
    chatBg: '#0B141A',
    outgoingBubble: '#005C4B',
    incomingBubble: '#202C33',
    bubbleText: '#E9EDEF',
    timestampText: '#8696A0',
    systemBg: '#182229',
    systemText: '#8696A0',
    inputBg: '#202C33',
    teal: '#00A884',
    tealDark: '#008069',
    green: '#00A884',
    blue: '#53BDEB',
    readTick: '#53BDEB',
    greyTick: '#8696A0',
  },
} as const;

/** Colors for group member names */
export const GROUP_MEMBER_COLORS = [
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#FF5722', // Deep Orange
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

/** Avatar background gradients */
export const AVATAR_COLORS = [
  { bg: 'linear-gradient(135deg, #9C27B0 0%, #9C27B0EE 100%)', text: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #2196F3 0%, #2196F3EE 100%)', text: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #4CAF50 0%, #4CAF50EE 100%)', text: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #FF9800 0%, #FF9800EE 100%)', text: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #E91E63 0%, #E91E63EE 100%)', text: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #00BCD4 0%, #00BCD4EE 100%)', text: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #FF5722 0%, #FF5722EE 100%)', text: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #607D8B 0%, #607D8BEE 100%)', text: '#FFFFFF' },
];

export const SYSTEM_EVENT_OPTIONS: Array<{
  label: string;
  value: SystemEventSubtype;
}> = [
  { label: 'Custom', value: 'custom' },
  { label: 'Date divider', value: 'date_divider' },
  { label: 'Participant added', value: 'participant_added' },
  { label: 'Participant left', value: 'participant_left' },
  { label: 'Participant removed', value: 'participant_removed' },
  { label: 'Group renamed', value: 'group_renamed' },
  { label: 'Group created', value: 'group_created' },
];

/** Default sample messages */
export const DEFAULT_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    text: 'Hey! How are you doing? :)',
    sender: 'them',
    senderId: 'them',
    senderName: 'Maya',
    senderAvatar: null,
    timestamp: '10:30 AM',
    status: 'read',
    type: 'text',
  },
  {
    id: 'msg-2',
    text: "I'm great, thanks for asking! Just working on a new project.",
    sender: 'me',
    senderId: 'me',
    senderName: 'You',
    senderAvatar: null,
    timestamp: '10:31 AM',
    status: 'read',
    type: 'text',
  },
  {
    id: 'msg-3',
    text: 'Voice call',
    sender: 'me',
    senderId: 'me',
    senderName: 'You',
    senderAvatar: null,
    timestamp: '10:32 AM',
    status: 'read',
    type: 'call',
    callType: 'voice',
    callStatus: 'outgoing',
  },
  {
    id: 'msg-4',
    text: 'Missed voice call',
    sender: 'them',
    senderId: 'them',
    senderName: 'Maya',
    senderAvatar: null,
    timestamp: '10:35 AM',
    status: 'read',
    type: 'call',
    callType: 'voice',
    callStatus: 'missed',
  },
  {
    id: 'msg-5',
    text: 'Voice note',
    sender: 'them',
    senderId: 'them',
    senderName: 'Maya',
    senderAvatar: null,
    timestamp: '10:36 AM',
    status: 'read',
    type: 'audio',
    duration: '0:18',
  },
  {
    id: 'msg-6',
    text: 'TODAY',
    sender: 'them',
    senderId: 'system',
    senderName: 'System',
    senderAvatar: null,
    timestamp: '10:37 AM',
    status: 'read',
    type: 'system_event',
    systemEvent: {
      eventSubtype: 'date_divider',
    },
  },
];

/** Default group members */
export const DEFAULT_GROUP_MEMBERS: GroupMember[] = [
  { id: 'gm-1', name: 'Alex', avatar: null, color: GROUP_MEMBER_COLORS[0] },
  { id: 'gm-2', name: 'Jordan', avatar: null, color: GROUP_MEMBER_COLORS[4] },
  { id: 'gm-3', name: 'Sam', avatar: null, color: GROUP_MEMBER_COLORS[2] },
];

/** Default export settings */
export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'webm',
  resolution: 2,
  typingDuration: 1.5,
  messageDelay: 0.8,
  videoWidth: 375,
  videoHeight: 812,
};

/** Phone frame dimensions (iPhone 14 Pro style) */
export const PHONE_FRAME = {
  width: 375,
  height: 812,
  borderRadius: 47,
  notchWidth: 126,
  notchHeight: 34,
  statusBarHeight: 54,
  dynamicIslandWidth: 120,
  dynamicIslandHeight: 36,
};

/** Default wallpaper color */
export const DEFAULT_WALLPAPER_COLOR = '#ECE5DD';

/** Max messages */
export const MAX_MESSAGES = 100;
