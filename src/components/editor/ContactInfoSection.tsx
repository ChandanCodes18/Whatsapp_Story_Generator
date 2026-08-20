'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import {
  User,
  Users,
  Camera,
  BadgeCheck,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import styles from '@/styles/editor.module.css';
import { useChatStore } from '@/hooks/useChatStore';
import { getInitials, getAvatarColor, readFileAsDataUrl } from '@/lib/utils';
import { GROUP_MEMBER_COLORS } from '@/lib/constants';

export function ContactInfoSection() {
  const chatMode = useChatStore((s) => s.chatMode);
  const setChatMode = useChatStore((s) => s.setChatMode);

  // Private mode state
  const contactName = useChatStore((s) => s.contactName);
  const contactAvatar = useChatStore((s) => s.contactAvatar);
  const contactStatus = useChatStore((s) => s.contactStatus);
  const isVerified = useChatStore((s) => s.isVerified);
  const setContactName = useChatStore((s) => s.setContactName);
  const setContactAvatar = useChatStore((s) => s.setContactAvatar);
  const setContactStatus = useChatStore((s) => s.setContactStatus);
  const setIsVerified = useChatStore((s) => s.setIsVerified);

  // Group mode state
  const groupName = useChatStore((s) => s.groupName);
  const groupAvatar = useChatStore((s) => s.groupAvatar);
  const groupMembers = useChatStore((s) => s.groupMembers);
  const setGroupName = useChatStore((s) => s.setGroupName);
  const setGroupAvatar = useChatStore((s) => s.setGroupAvatar);
  const addGroupMember = useChatStore((s) => s.addGroupMember);
  const updateGroupMember = useChatStore((s) => s.updateGroupMember);
  const removeGroupMember = useChatStore((s) => s.removeGroupMember);

  // Current User profile state & actions
  const currentUser = useChatStore((s) => s.currentUser);
  const setCurrentUserName = useChatStore((s) => s.setCurrentUserName);
  const setCurrentUserAvatar = useChatStore((s) => s.setCurrentUserAvatar);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const groupAvatarInputRef = useRef<HTMLInputElement>(null);
  const userAvatarInputRef = useRef<HTMLInputElement>(null);
  const memberAvatarInputRef = useRef<HTMLInputElement>(null);

  const [activeUploadMemberId, setActiveUploadMemberId] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setContactAvatar(dataUrl);
    e.target.value = '';
  };

  const handleGroupAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setGroupAvatar(dataUrl);
    e.target.value = '';
  };

  const handleUserAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setCurrentUserAvatar(dataUrl);
    e.target.value = '';
  };

  const handleMemberAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadMemberId) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateGroupMember(activeUploadMemberId, { avatar: dataUrl });
    setActiveUploadMemberId(null);
    e.target.value = '';
  };

  const handleAddMember = () => {
    const nextColorIndex = groupMembers.length % GROUP_MEMBER_COLORS.length;
    addGroupMember({
      name: `Member ${groupMembers.length + 1}`,
      avatar: null,
      color: GROUP_MEMBER_COLORS[nextColorIndex],
    });
  };

  const avatarColorInfo = getAvatarColor(contactName || 'U');
  const groupAvatarColorInfo = getAvatarColor(groupName || 'G');
  const userAvatarColorInfo = getAvatarColor(currentUser.name || 'Y');

  return (
    <>
      {/* ── Your Profile (Me) ────────────────────────────── */}
      <div className={styles.sectionHeading} style={{ marginBottom: 'var(--space-2)' }}>
        <div className={styles.sectionHeadingContent}>
          <div className={styles.sectionTitle}>Your Profile (Me)</div>
          <p className={styles.sectionSubtitle}>
            Customize your own name and avatar for outgoing messages.
          </p>
        </div>
      </div>

      <div className={styles.bubbleEditorRow} style={{ marginBottom: 'var(--space-4)' }}>
        <div
          className={styles.avatarUpload}
          onClick={() => userAvatarInputRef.current?.click()}
        >
          {currentUser.avatar ? (
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              width={48}
              height={48}
              unoptimized
              className={styles.avatarUploadImage}
            />
          ) : (
            <div
              className={styles.avatarInitial}
              style={{ background: userAvatarColorInfo.bg }}
            >
              {getInitials(currentUser.name)}
            </div>
          )}
          <div className={styles.avatarUploadOverlay}>
            <Camera size={16} />
          </div>
          <input
            ref={userAvatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleUserAvatarUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label className={styles.label}>Your Name</label>
          <input
            type="text"
            className={styles.input}
            value={currentUser.name}
            onChange={(e) => setCurrentUserName(e.target.value)}
            placeholder="Your name"
          />
        </div>
      </div>

      <div className={styles.sectionDivider} />

      {/* ── Private / Group Toggle ────────────────────────── */}
      <div className={styles.segmentedControl}>
        <button
          className={`${styles.segmentedButton} ${
            chatMode === 'private' ? styles.segmentedButtonActive : ''
          }`}
          onClick={() => setChatMode('private')}
        >
          <User size={14} className={styles.segmentedButtonIcon} />
          Private
        </button>
        <button
          className={`${styles.segmentedButton} ${
            chatMode === 'group' ? styles.segmentedButtonActive : ''
          }`}
          onClick={() => setChatMode('group')}
        >
          <Users size={14} className={styles.segmentedButtonIcon} />
          Group
        </button>
      </div>

      {chatMode === 'private' ? (
        /* ── Private Mode ───────────────────────────────── */
        <>
          {/* Avatar + Name row */}
          <div className={styles.bubbleEditorRow}>
            {/* Avatar upload */}
            <div
              className={styles.avatarUpload}
              onClick={() => avatarInputRef.current?.click()}
            >
              {contactAvatar ? (
                <Image
                  src={contactAvatar}
                  alt={contactName}
                  width={48}
                  height={48}
                  unoptimized
                  className={styles.avatarUploadImage}
                />
              ) : (
                <div
                  className={styles.avatarInitial}
                  style={{ background: avatarColorInfo.bg }}
                >
                  {getInitials(contactName)}
                </div>
              )}
              <div className={styles.avatarUploadOverlay}>
                <Camera size={16} />
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />

              {/* Verified badge toggle */}
              <div
                className={styles.verifiedBadge}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVerified(!isVerified);
                }}
                title={isVerified ? 'Remove verified badge' : 'Add verified badge'}
                style={{
                  color: isVerified ? 'var(--wa-blue-tick, #53BDEB)' : 'var(--muted-foreground)',
                  opacity: isVerified ? 1 : 0.4,
                }}
              >
                <BadgeCheck size={12} />
              </div>
            </div>

            {/* Name input */}
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Contact Name</label>
              <input
                type="text"
                className={styles.input}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact name"
              />
            </div>
          </div>

          {/* Status input */}
          <div>
            <label className={styles.label}>Status</label>
            <input
              type="text"
              className={styles.input}
              value={contactStatus}
              onChange={(e) => setContactStatus(e.target.value)}
              placeholder="online, last seen today at 3:42 PM..."
            />
          </div>
        </>
      ) : (
        /* ── Group Mode ─────────────────────────────────── */
        <>
          {/* Group avatar + name row */}
          <div className={styles.bubbleEditorRow}>
            <div
              className={styles.avatarUpload}
              onClick={() => groupAvatarInputRef.current?.click()}
            >
              {groupAvatar ? (
                <Image
                  src={groupAvatar}
                  alt={groupName}
                  width={48}
                  height={48}
                  unoptimized
                  className={styles.avatarUploadImage}
                />
              ) : (
                <div
                  className={styles.avatarInitial}
                  style={{ background: groupAvatarColorInfo.bg }}
                >
                  {getInitials(groupName)}
                </div>
              )}
              <div className={styles.avatarUploadOverlay}>
                <Camera size={16} />
              </div>
              <input
                ref={groupAvatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleGroupAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label className={styles.label}>Group Name</label>
              <input
                type="text"
                className={styles.input}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
              />
            </div>
          </div>

          {/* Members list */}
          <div>
            <div className={styles.bubbleEditorRowSpaced}>
              <label className={styles.label} style={{ marginBottom: 0 }}>
                Members
              </label>
              <span className={styles.badgeMuted} style={{ fontSize: '0.625rem' }}>
                {groupMembers.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              {groupMembers.map((member) => (
                <div key={member.id} className={styles.groupMemberRow}>
                  {/* Avatar Upload */}
                  <div
                    className={`${styles.avatarUpload} ${styles.avatarUploadSmall}`}
                    onClick={() => {
                      setActiveUploadMemberId(member.id);
                      memberAvatarInputRef.current?.click();
                    }}
                    title="Upload profile picture"
                  >
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={36}
                        height={36}
                        unoptimized
                        className={styles.avatarUploadImage}
                      />
                    ) : (
                      <div
                        className={styles.avatarInitial}
                        style={{
                          background: member.color,
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                    )}
                    <div className={styles.avatarUploadOverlay}>
                      <Camera size={12} />
                    </div>
                  </div>

                  {/* Name */}
                  <input
                    type="text"
                    className={`${styles.input} ${styles.inputSmall} ${styles.groupMemberName}`}
                    value={member.name}
                    onChange={(e) =>
                      updateGroupMember(member.id, { name: e.target.value })
                    }
                    placeholder="Member name"
                  />
                  {/* Actions (Remove Avatar / Delete Member) */}
                  <div className={styles.groupMemberActions}>
                    {member.avatar && (
                      <button
                        className={styles.deleteButton}
                        onClick={() => updateGroupMember(member.id, { avatar: null })}
                        title="Remove profile picture"
                        style={{ marginRight: '4px' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      className={styles.deleteButton}
                      onClick={() => removeGroupMember(member.id)}
                      title="Remove member"
                      disabled={groupMembers.length <= 1}
                      style={groupMembers.length <= 1 ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add member */}
            <button
              className={styles.addMessageButton}
              onClick={handleAddMember}
              style={{ marginTop: 'var(--space-2)' }}
            >
              <span className={styles.addMessageButtonIcon}>
                <Plus size={12} />
              </span>
              Add Member
            </button>

            {/* Hidden Input for Member Avatar Upload */}
            <input
              ref={memberAvatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleMemberAvatarUpload}
              style={{ display: 'none' }}
            />
          </div>
        </>
      )}
    </>
  );
}
