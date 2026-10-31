import { GROUP_MEMBER_COLORS } from './constants';
import { generateId } from './utils';
import type { GroupMember, Message } from './types';

export interface ParsedScript {
  groupName: string;
  /** 'me' character name (first character marked with * or the first speaker) */
  myName: string;
  members: GroupMember[];
  messages: Message[];
  /** Any parse warnings to show the user */
  warnings: string[];
}

/**
 * Supported script format (plain text or markdown):
 *
 *   Group: Friends Group          ← optional header directive
 *   Me: Alice                     ← optional — marks which character is "me"
 *
 *   Alice: Hey everyone!
 *   Bob: What's up?
 *   *Alice: I'm the "me" speaker  ← prefix * also marks speaker as "me"
 *   Alice: Nothing much.
 *
 * Blank lines are ignored.
 * Lines starting with # are treated as date-divider system events.
 * Lines starting with --- are treated as dividers too.
 */
export function parseScript(raw: string): ParsedScript {
  const warnings: string[] = [];
  const lines = raw.split(/\r?\n/);

  let groupName = 'Group Chat';
  let myCharName: string | null = null;

  // First pass: read header directives
  const bodyLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const groupMatch = trimmed.match(/^(?:group|chat|title)\s*:\s*(.+)$/i);
    if (groupMatch) {
      groupName = groupMatch[1].trim();
      continue;
    }

    const meMatch = trimmed.match(/^me\s*:\s*(.+)$/i);
    if (meMatch) {
      myCharName = meMatch[1].trim();
      continue;
    }

    bodyLines.push(trimmed);
  }

  // Second pass: collect character names in order of first appearance
  const characterOrder: string[] = [];
  const characterSet = new Set<string>();

  for (const line of bodyLines) {
    if (line.startsWith('#') || line.startsWith('---')) continue;

    // Support "Name: text" or "*Name: text" (starred = me)
    const match = line.match(/^\*?([^:]+?)\s*:\s*.+$/);
    if (match) {
      const rawName = match[1].trim();
      const name = rawName.startsWith('*') ? rawName.slice(1).trim() : rawName;
      if (!characterSet.has(name)) {
        characterSet.add(name);
        characterOrder.push(name);
      }
    }
  }

  if (characterOrder.length === 0) {
    warnings.push('No dialogue lines found. Make sure lines follow the format: Name: dialogue');
  }

  // Determine "me" character
  // Priority: explicit Me: directive > first character marked with * > first character
  if (!myCharName) {
    for (const line of bodyLines) {
      const match = line.match(/^\*([^:]+?)\s*:\s*.+$/);
      if (match) {
        myCharName = match[1].trim();
        break;
      }
    }
  }
  if (!myCharName && characterOrder.length > 0) {
    myCharName = characterOrder[0];
    warnings.push(
      `No "Me:" directive found. Treating "${myCharName}" as you (the right-side sender). Add "Me: <name>" at the top to change this.`
    );
  }

  // Build GroupMember list (exclude "me" character — they are currentUser)
  const members: GroupMember[] = [];
  let colorIdx = 0;
  const memberMap = new Map<string, GroupMember>(); // name → GroupMember

  for (const name of characterOrder) {
    if (name === myCharName) continue;
    const member: GroupMember = {
      id: generateId('gm'),
      name,
      avatar: null,
      color: GROUP_MEMBER_COLORS[colorIdx % GROUP_MEMBER_COLORS.length],
    };
    members.push(member);
    memberMap.set(name, member);
    colorIdx++;
  }

  // Third pass: build messages
  const messages: Message[] = [];
  let msgIndex = 0;

  const baseDate = new Date();
  baseDate.setHours(10, 0, 0, 0);

  for (const line of bodyLines) {
    // Date divider
    if (line.startsWith('#')) {
      const dividerText = line.replace(/^#+\s*/, '').trim() || 'TODAY';
      messages.push({
        id: generateId('msg'),
        text: dividerText.toUpperCase(),
        sender: 'them',
        senderId: 'system',
        senderName: 'System',
        senderAvatar: null,
        timestamp: formatMsgTime(baseDate, msgIndex),
        status: 'read',
        type: 'system_event',
        systemEvent: { eventSubtype: 'date_divider' },
      });
      continue;
    }

    if (line.startsWith('---')) {
      messages.push({
        id: generateId('msg'),
        text: line.replace(/^-+\s*/, '').trim() || '─────────',
        sender: 'them',
        senderId: 'system',
        senderName: 'System',
        senderAvatar: null,
        timestamp: formatMsgTime(baseDate, msgIndex),
        status: 'read',
        type: 'system_event',
        systemEvent: { eventSubtype: 'custom' },
      });
      continue;
    }

    // Dialogue line: *Name: text  or  Name: text
    const match = line.match(/^(\*?)([^:]+?)\s*:\s*(.+)$/);
    if (!match) {
      if (line.length > 0) {
        warnings.push(`Skipped unrecognised line: "${line.slice(0, 60)}"`);
      }
      continue;
    }

    const starPrefix = match[1] === '*';
    const speakerRaw = match[2].trim();
    const speaker = starPrefix ? speakerRaw : speakerRaw;
    const text = match[3].trim();

    const isMe = speaker === myCharName || starPrefix;
    const member = memberMap.get(speaker);

    const timestamp = formatMsgTime(baseDate, msgIndex);
    msgIndex++;

    // Check if message is a Poll: [Poll] Question? | Option 1 | Option 2
    let messageType: import('./types').MessageType = 'text';
    let pollQuestion: string | undefined;
    let pollOptions: { id: string; text: string; votes?: number }[] | undefined;
    const pollAllowMultiple = false;

    const pollMatch = text.match(/^\[poll(?::\s*([^\]]+))?\]\s*(.*)$/i);
    if (pollMatch) {
      messageType = 'poll';
      const questionFromBracket = pollMatch[1]?.trim();
      const rest = pollMatch[2].trim();

      if (questionFromBracket) {
        pollQuestion = questionFromBracket;
        const opts = rest.split('|').map((s) => s.trim()).filter(Boolean);
        pollOptions = opts.map((opt, i) => ({
          id: `opt-${Date.now()}-${i + 1}`,
          text: opt,
          votes: 0,
        }));
      } else {
        const parts = rest.split('|').map((s) => s.trim()).filter(Boolean);
        pollQuestion = parts[0] || 'Poll Question';
        pollOptions = parts.slice(1).map((opt, i) => ({
          id: `opt-${Date.now()}-${i + 1}`,
          text: opt,
          votes: 0,
        }));
      }

      if (!pollOptions || pollOptions.length < 2) {
        pollOptions = [
          { id: `opt-${Date.now()}-1`, text: 'Yes', votes: 0 },
          { id: `opt-${Date.now()}-2`, text: 'No', votes: 0 },
        ];
      }
    }

    if (isMe) {
      messages.push({
        id: generateId('msg'),
        text: pollQuestion || text,
        sender: 'me',
        senderId: 'me',
        senderName: myCharName ?? 'You',
        senderAvatar: null,
        timestamp,
        status: 'read',
        type: messageType as any,
        pollQuestion,
        pollOptions,
        pollAllowMultiple,
        pollSelectedOptionIds: [],
      });
    } else if (member) {
      messages.push({
        id: generateId('msg'),
        text: pollQuestion || text,
        sender: 'them',
        senderId: member.id,
        senderName: member.name,
        senderAvatar: null,
        groupMemberId: member.id,
        timestamp,
        status: 'read',
        type: messageType as any,
        pollQuestion,
        pollOptions,
        pollAllowMultiple,
        pollSelectedOptionIds: [],
      });
    } else {
      // Unknown speaker — treat as generic "them"
      warnings.push(`Unknown speaker "${speaker}" — added as a generic message.`);
      messages.push({
        id: generateId('msg'),
        text: pollQuestion || text,
        sender: 'them',
        senderId: 'them',
        senderName: speaker,
        senderAvatar: null,
        timestamp,
        status: 'read',
        type: messageType as any,
        pollQuestion,
        pollOptions,
        pollAllowMultiple,
        pollSelectedOptionIds: [],
      });
    }
  }

  return {
    groupName,
    myName: myCharName ?? 'You',
    members,
    messages,
    warnings,
  };
}

/** Spread messages across 10:00 AM → sequential minutes */
function formatMsgTime(base: Date, index: number): string {
  const d = new Date(base.getTime() + index * 60 * 1000);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
