'use client';

import React from 'react';
import Image from 'next/image';
import styles from '@/styles/preview.module.css';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { Video, Phone, ChevronLeft } from 'lucide-react';

interface ChatHeaderProps {
  name: string;
  avatar: string | null;
  status: string;
  isVerified: boolean;
  isDark: boolean;
  isGroup: boolean;
  memberCount?: number;
}

export function ChatHeader({
  name,
  avatar,
  status,
  isVerified,
  isDark,
  isGroup,
  memberCount,
}: ChatHeaderProps) {
  const avatarColor = getAvatarColor(name);
  const initials = getInitials(name);
  const secondaryInitial = isGroup ? 'M' : initials.slice(0, 1);

  const headerClass = [
    styles.header,
    isDark ? styles.headerDark : '',
  ].filter(Boolean).join(' ');
  const showGroupStack = isGroup && !avatar;

  const displayStatus = status
    || (isGroup
      ? `You${memberCount ? `, ${memberCount - 1} others` : ''}`
      : '');

  return (
    <div className={headerClass}>
      <div className={styles.headerLeft}>
        <button className={styles.backArrow} aria-label="Back">
          <ChevronLeft size={24} />
        </button>
        <div
          className={`${styles.headerAvatarGroup} ${
            showGroupStack ? '' : styles.headerAvatarGroupSingle
          }`}
        >
          <div className={styles.headerAvatar}>
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                width={32}
                height={32}
                unoptimized
                className={styles.headerAvatarImg}
              />
            ) : (
              <div
                className={styles.headerAvatarInitial}
                style={{ background: avatarColor.bg, color: avatarColor.text }}
              >
                {initials}
              </div>
            )}
          </div>
          {showGroupStack && (
            <>
              <div className={styles.headerAvatarBadge}>+1</div>
              <div className={styles.headerAvatarSecondary}>{secondaryInitial}</div>
            </>
          )}
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>
            {name}
            {isVerified && (
              <svg className={styles.verifiedIcon} viewBox="0 0 24 24" width="16" height="16" fill="#53BDEB">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </div>
          {displayStatus && (
            <div className={styles.headerStatus}>{displayStatus}</div>
          )}
        </div>
      </div>
      <div className={styles.headerActions} aria-label="Call actions">
        <button className={styles.headerIcon} aria-label="Video call">
          <Video size={20} />
        </button>
        <button className={styles.headerIcon} aria-label="Voice call">
          <Phone size={20} />
        </button>
      </div>
    </div>
  );
}
