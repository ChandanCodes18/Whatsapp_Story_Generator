'use client';

import type { Message } from '@/lib/types';
import { ChatBubble } from './ChatBubble';

interface MessageFeedItemProps {
  message: Message;
  isDark: boolean;
  showTimestamp: boolean;
  showReadReceipt: boolean;
  senderName?: string;
  senderColor?: string;
  isFirstFromSender: boolean;
}

function SystemEventNotice({ text, isDark }: { text: string; isDark: boolean }) {
  return (
    <div className="flex w-full justify-center px-3 py-1">
      <div
        className={[
          'max-w-[85%] rounded-full border px-3 py-1.5 text-center text-[11px] font-medium',
          'leading-relaxed tracking-[0.01em] shadow-sm backdrop-blur-sm',
          isDark
            ? 'border-white/10 bg-[#111b21]/85 text-[#b7c4cc]'
            : 'border-slate-200/80 bg-white/90 text-[#54656f]',
        ].join(' ')}
      >
        {text}
      </div>
    </div>
  );
}

export function MessageFeedItem(props: MessageFeedItemProps) {
  const { message, isDark } = props;

  switch (message.type) {
    case 'system_event':
      return <SystemEventNotice text={message.text} isDark={isDark} />;
    case 'text':
    case 'photo':
    case 'video':
    case 'audio':
    case 'call':
    case 'deleted':
    default:
      return <ChatBubble {...props} />;
  }
}
