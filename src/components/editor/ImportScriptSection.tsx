'use client';

import React, { useCallback, useRef, useState } from 'react';
import { FileText, Upload, AlertTriangle, CheckCircle2, X, Wand2 } from 'lucide-react';
import styles from '@/styles/editor.module.css';
import { parseScript } from '@/lib/scriptParser';
import { useChatStore } from '@/hooks/useChatStore';

export function ImportScriptSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [scriptText, setScriptText] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importFromScript = useChatStore((s) => s.importFromScript);

  // ── File reading ────────────────────────────────────────────────
  const readFile = useCallback((file: File) => {
    setSuccess(false);
    setWarnings([]);
    setError(null);

    if (!file.name.match(/\.(txt|md|markdown)$/i)) {
      setError('Only .txt and .md files are supported.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setScriptText((e.target?.result as string) ?? '');
    reader.onerror = () => setError('Failed to read the file.');
    reader.readAsText(file, 'utf-8');
  }, []);

  // ── Drag & drop ─────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  // ── Apply ───────────────────────────────────────────────────────
  const handleApply = () => {
    setError(null);
    setSuccess(false);
    setWarnings([]);

    const text = scriptText.trim();
    if (!text) {
      setError('Nothing to parse. Upload a file or type/paste script text below.');
      return;
    }

    try {
      const parsed = parseScript(text);
      importFromScript(parsed);
      setWarnings(parsed.warnings);
      setSuccess(true);
    } catch (err) {
      setError(`Parse error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleClear = () => {
    setFileName(null);
    setScriptText('');
    setWarnings([]);
    setSuccess(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Format hint ───────────────────────────────────────── */}
      <div className={styles.formHint} style={{ fontSize: 11, lineHeight: 1.5 }}>
        <strong>Supported format (.txt or .md):</strong>
        <pre style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: 10, whiteSpace: 'pre-wrap' }}>
{`Group: Friends Group
Me: Alice

Alice: Hey everyone!
Bob: What's up?
Alice: [Poll] Movie night? | Sci-Fi | Comedy | Horror
# TODAY
Alice: Just chilling ☀️`}
        </pre>
      </div>

      {/* ── Drop zone ─────────────────────────────────────────── */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 8,
          padding: '16px 12px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'var(--primary-subtle)' : 'var(--bg-secondary)',
          transition: 'all 0.15s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {fileName ? (
          <>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--foreground)' }}>{fileName}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Click to replace</span>
          </>
        ) : (
          <>
            <Upload size={20} style={{ color: 'var(--muted)' }} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              Drag &amp; drop or <strong style={{ color: 'var(--primary)' }}>browse</strong>
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>.txt or .md</span>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.markdown"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* ── Or type/paste ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label className={styles.label}>Or paste script text</label>
        <textarea
          className={styles.input}
          rows={7}
          value={scriptText}
          onChange={(e) => {
            setScriptText(e.target.value);
            setSuccess(false);
            setError(null);
          }}
          placeholder={`Group: Squad\nMe: Alice\n\nAlice: Hey!\nBob: Hello!`}
          style={{ fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
        />
      </div>

      {/* ── Error / Success / Warnings ────────────────────────── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 6,
          background: 'var(--error-subtle, #FEF2F2)', borderRadius: 6,
          padding: '8px 10px', color: 'var(--error, #DC2626)', fontSize: 12,
        }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--success-subtle, #F0FDF4)', borderRadius: 6,
          padding: '8px 10px', color: 'var(--success, #16A34A)', fontSize: 12,
        }}>
          <CheckCircle2 size={14} />
          <span>Script imported! Check the Messages and Contact sections.</span>
        </div>
      )}

      {warnings.length > 0 && (
        <div style={{
          background: 'var(--warning-subtle, #FFFBEB)', borderRadius: 6,
          padding: '8px 10px', fontSize: 12,
          color: 'var(--warning-fg, #92400E)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
            <AlertTriangle size={13} /> Warnings
          </div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className={styles.primaryButton}
          onClick={handleApply}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <Wand2 size={14} />
          Apply Script
        </button>
        {(scriptText || fileName) && (
          <button
            className={styles.deleteButton}
            onClick={handleClear}
            title="Clear"
            style={{ padding: '0 10px' }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
