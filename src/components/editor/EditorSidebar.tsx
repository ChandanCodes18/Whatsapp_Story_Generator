'use client';

import React from 'react';
import {
  LayoutGrid,
  User,
  MessageSquare,
  Settings,
  Download,
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import styles from '@/styles/editor.module.css';
import { useChatStore } from '@/hooks/useChatStore';
import type { EditorSection } from '@/lib/types';
import { CreateSection } from './CreateSection';
import { ContactInfoSection } from './ContactInfoSection';
import { MessagesSection } from './MessagesSection';
import { SettingsSection } from './SettingsSection';
import { ExportSection } from './ExportSection';

interface SectionConfig {
  id: EditorSection;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function EditorSidebar() {
  const editorTheme = useChatStore((s) => s.editorTheme);
  const setEditorTheme = useChatStore((s) => s.setEditorTheme);
  const expandedSections = useChatStore((s) => s.expandedSections);
  const toggleSection = useChatStore((s) => s.toggleSection);
  const messages = useChatStore((s) => s.messages);

  const sections: SectionConfig[] = [
    {
      id: 'create',
      title: 'Create',
      subtitle: 'Platform & type',
      icon: <LayoutGrid size={16} />,
      content: <CreateSection />,
    },
    {
      id: 'contact',
      title: 'Contact Info',
      subtitle: 'Name, avatar & mode',
      icon: <User size={16} />,
      content: <ContactInfoSection />,
    },
    {
      id: 'messages',
      title: 'Messages',
      subtitle: `${messages.length} message${messages.length !== 1 ? 's' : ''}`,
      icon: <MessageSquare size={16} />,
      content: <MessagesSection />,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Theme & display',
      icon: <Settings size={16} />,
      content: <SettingsSection />,
    },
    {
      id: 'export',
      title: 'Export',
      subtitle: 'Download & share',
      icon: <Download size={16} />,
      content: <ExportSection />,
    },
  ];

  return (
    <aside className={styles.sidebar}>
      {/* ── Sticky Header ─────────────────────────────────── */}
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>
          <Sparkles size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <h1>Story Generator</h1>
          <span>WhatsApp Chat Mockup</span>
        </div>
        <button
          className={styles.deleteButton}
          onClick={() => setEditorTheme(editorTheme === 'light' ? 'dark' : 'light')}
          title={`Switch to ${editorTheme === 'light' ? 'dark' : 'light'} editor theme`}
          style={{ color: 'var(--foreground)' }}
        >
          {editorTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      {/* ── Scrollable Content ────────────────────────────── */}
      <div className={styles.sidebarContent}>
        {sections.map((section) => {
          const isOpen = expandedSections.has(section.id);

          return (
            <div key={section.id} className={styles.card}>
              {/* Accordion header */}
              <button
                className={styles.cardHeader}
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
              >
                <div className={styles.cardHeaderIcon}>{section.icon}</div>
                <div className={styles.cardHeaderTitle}>
                  {section.title}
                  {section.subtitle && (
                    <span className={styles.cardHeaderSubtitle}>
                      {section.subtitle}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`${styles.cardHeaderChevron} ${
                    isOpen ? styles.cardHeaderChevronOpen : ''
                  }`}
                />
              </button>

              {/* Accordion panel */}
              {isOpen && (
                <>
                  <div className={styles.cardPanelDivider} />
                  <div className={styles.cardPanel}>{section.content}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
