'use client';

import { useEffect, useState } from 'react';
import { CalendarPlus2 } from 'lucide-react';
import styles from '@/styles/editor.module.css';
import { SYSTEM_EVENT_OPTIONS } from '@/lib/constants';
import { useChatStore } from '@/hooks/useChatStore';
import type { SystemEventSubtype } from '@/lib/types';

function buildDefaultEventText(
  subtype: SystemEventSubtype,
  groupName: string,
  contactName: string
) {
  switch (subtype) {
    case 'date_divider':
      return 'TODAY';
    case 'participant_added':
      return `You added ${contactName || 'a participant'}`;
    case 'participant_left':
      return `${contactName || 'A participant'} left`;
    case 'participant_removed':
      return `You removed ${contactName || 'a participant'}`;
    case 'group_renamed':
      return `You changed the subject to "${groupName || 'New Group'}"`;
    case 'group_created':
      return `You created group "${groupName || 'New Group'}"`;
    case 'custom':
    default:
      return '';
  }
}

export function SystemEventCreator() {
  const addMessage = useChatStore((s) => s.addMessage);
  const groupName = useChatStore((s) => s.groupName);
  const contactName = useChatStore((s) => s.contactName);

  const [eventSubtype, setEventSubtype] = useState<SystemEventSubtype>('custom');
  const [eventText, setEventText] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) {
      setEventText(buildDefaultEventText(eventSubtype, groupName, contactName));
    }
  }, [contactName, eventSubtype, groupName, isDirty]);

  const handleAddEvent = () => {
    const trimmed = eventText.trim();
    if (!trimmed) return;

    addMessage({
      type: 'system_event',
      text: trimmed,
      sender: 'them',
      status: 'read',
      systemEvent: {
        eventSubtype,
      },
    });

    setEventSubtype('custom');
    setEventText('');
    setIsDirty(false);
  };

  return (
    <div className={`${styles.sectionBlock} ${styles.sectionBlockAccent}`}>
      <div className={styles.sectionHeading}>
        <div className={styles.sectionHeadingContent}>
          <div className={styles.sectionTitle}>Event Builder</div>
          <p className={styles.sectionSubtitle}>
            Add WhatsApp-style timeline notices like date dividers, participant changes,
            and group updates.
          </p>
        </div>
        <div className={styles.sectionIconBadge}>
          <CalendarPlus2 size={16} />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Type</label>
        <select
          value={eventSubtype}
          onChange={(e) => {
            setEventSubtype(e.target.value as SystemEventSubtype);
            setIsDirty(false);
          }}
          className={styles.compactSelect}
        >
          {SYSTEM_EVENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Event Text</label>
        <textarea
          rows={3}
          value={eventText}
          onChange={(e) => {
            setEventText(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Type the event text shown in the feed..."
          className={styles.textarea}
          style={{ minHeight: '92px', resize: 'vertical' }}
        />
        <p className={styles.helperText}>
          Presets auto-fill the text, but you can still edit it before adding the event.
        </p>
      </div>

      <div className={styles.bubbleEditorRowSpaced}>
        <span className={styles.helperText}>System events appear centered across the full feed.</span>
        <button
          type="button"
          onClick={handleAddEvent}
          disabled={!eventText.trim()}
          className={styles.primaryActionButton}
        >
          Add event
        </button>
      </div>
    </div>
  );
}
