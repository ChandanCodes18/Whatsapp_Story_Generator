import { toCanvas } from 'html-to-image';
import { delay, downloadBlob } from './utils';
import type { ExportSettings, Message, MessageInput } from './types';
import { AudioMixer } from './audioMixer';
import { Muxer, ArrayBufferTarget } from 'webm-muxer';

/**
 * Waits until React has committed state updates AND the browser has painted.
 * More reliable than a fixed delay for DOM-capture scenarios.
 */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    // Two nested rAFs: first fires at the start of the next frame (after React
    // commits), second fires at the start of the frame after that (after paint).
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────────────────────

interface VideoExportOptions {
  messages: Message[];
  settings: ExportSettings;
  onProgress?: (progress: number) => void;
  elementId?: string;
  clearMessages: () => void;
  addMessage: (msg: MessageInput) => void;
  setMessages: (messages: Message[]) => void;
  setTypingMessage: (message: Message | null) => void;
  setActiveLightboxMessageId: (id: string | null) => void;
  setPlayingMessageId: (id: string | null) => void;
  setPlayingMessageProgress: (progress: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW — plays the animation in real-time, audio via speakers
// ─────────────────────────────────────────────────────────────────────────────

type PlaybackOptions = Omit<VideoExportOptions, 'elementId'> & {
  onFrame?: () => Promise<void>;
  includeInitialPause?: boolean;
  includeFinalPause?: boolean;
  audioMixer?: AudioMixer;
  /** When true, skip all wall-clock delays for faster-than-real-time export */
  fastMode?: boolean;
};

function getMessageDurations(
  messages: Message[],
  settings: ExportSettings
): { [id: string]: number } {
  const durations: { [id: string]: number } = {};
  messages.forEach((msg) => {
    let ms = settings.messageDelay * 1000;
    if (msg.type === 'audio') {
      const s = parseFloat((msg as any).duration || '7');
      ms = isNaN(s) ? 7000 : s * 1000;
    } else if (msg.type === 'video') {
      const s = parseFloat((msg as any).duration || '5');
      ms = isNaN(s) ? 5000 : s * 1000;
    } else if (msg.type === 'photo') {
      ms += 3000;
    }
    durations[msg.id] = ms;
  });
  return durations;
}

async function playMessageSequence({
  messages,
  settings,
  onProgress,
  clearMessages,
  addMessage,
  setMessages,
  setTypingMessage,
  setActiveLightboxMessageId,
  setPlayingMessageId,
  setPlayingMessageProgress,
  onFrame,
  includeInitialPause = true,
  includeFinalPause = true,
  audioMixer,
  fastMode = false,
}: PlaybackOptions): Promise<void> {
  if (messages.length === 0) throw new Error('No messages to preview or export');

  // In fast mode, skip all wall-clock delays — frames are produced as fast as
  // the CPU can render them.  In normal mode, pace at ~30 FPS real-time.
  const pace = fastMode
    ? () => Promise.resolve()
    : (ms: number) => delay(ms);

  const originalMessages = [...messages];
  clearMessages();
  setTypingMessage(null);
  setActiveLightboxMessageId(null);
  setPlayingMessageId(null);
  setPlayingMessageProgress(0);
  await pace(300);

  if (includeInitialPause) {
    for (let i = 0; i < 15; i++) { await onFrame?.(); await pace(33); }
  }

  const totalMessages = originalMessages.length;
  const displayDurations = getMessageDurations(originalMessages, settings);

  try {
    for (let i = 0; i < totalMessages; i++) {
      const msg = originalMessages[i];
      const baseProgress = (i / totalMessages) * 90;

      if (msg.type !== 'system_event') {
        setTypingMessage(msg);
        const typingFrames = Math.ceil(settings.typingDuration * 30);
        for (let f = 0; f < typingFrames; f++) {
          onProgress?.(Math.round(baseProgress + (f / typingFrames) * (40 / totalMessages)));
          const t0 = performance.now();
          await onFrame?.();
          await pace(Math.max(5, 33.3 - (performance.now() - t0)));
        }
      }

      setTypingMessage(null);
      addMessage({ ...msg });
      if (msg.type !== 'system_event' && audioMixer) audioMixer.playSfx();

      for (let f = 0; f < 5; f++) { await onFrame?.(); await pace(33); }

      const displayMs = displayDurations[msg.id];
      const displayFrames = Math.ceil((displayMs / 1000) * 30);

      if (msg.type === 'photo') {
        for (let f = 0; f < Math.ceil(0.5 * 30); f++) { await onFrame?.(); await pace(33); }
        setActiveLightboxMessageId(msg.id);
        for (let f = 0; f < Math.ceil(3.0 * 30); f++) { await onFrame?.(); await pace(33); }
        setActiveLightboxMessageId(null);
      } else if (msg.type === 'audio') {
        setPlayingMessageId(msg.id);
        if (audioMixer && (msg as any).mediaUrl) {
          let done = false;
          audioMixer.playVoiceNote((msg as any).mediaUrl, displayMs, (p) => setPlayingMessageProgress(p))
            .then(() => { done = true; });
          while (!done) {
            const t0 = performance.now();
            await onFrame?.();
            await pace(Math.max(5, 33.3 - (performance.now() - t0)));
          }
        } else {
          for (let f = 0; f < displayFrames; f++) {
            setPlayingMessageProgress(Math.round((f / displayFrames) * 100));
            const t0 = performance.now();
            await onFrame?.();
            await pace(Math.max(5, 33.3 - (performance.now() - t0)));
          }
        }
        setPlayingMessageId(null);
        setPlayingMessageProgress(0);
      } else {
        for (let f = 0; f < displayFrames; f++) {
          onProgress?.(Math.round(baseProgress + 40 / totalMessages + (f / displayFrames) * (50 / totalMessages)));
          const t0 = performance.now();
          await onFrame?.();
          await pace(Math.max(5, 33.3 - (performance.now() - t0)));
        }
      }
    }

    if (includeFinalPause) {
      for (let i = 0; i < 45; i++) { await onFrame?.(); await pace(33); }
    }
    onProgress?.(100);
  } finally {
    setTypingMessage(null);
    setActiveLightboxMessageId(null);
    setPlayingMessageId(null);
    setPlayingMessageProgress(0);
    setMessages(originalMessages);
  }
}

export async function previewVideo(options: VideoExportOptions): Promise<void> {
  const mixer = new AudioMixer(false);
  await playMessageSequence({
    ...options,
    includeInitialPause: false,
    includeFinalPause: false,
    audioMixer: mixer,
  });
  mixer.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT (Fast) — offline frame-by-frame encoding via WebCodecs + webm-muxer
// ─────────────────────────────────────────────────────────────────────────────

async function exportVideoFast(options: VideoExportOptions): Promise<void> {
  const { settings, onProgress, elementId = 'whatsapp-preview' } = options;
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);

  const pixelRatio = settings.resolution;
  const width = element.offsetWidth * pixelRatio;
  const height = element.offsetHeight * pixelRatio;

  // ── Determine best video codec ──────────────────────────────────────────
  let encoderCodec = 'vp8';
  let muxerVideoCodec: 'V_VP8' | 'V_VP9' = 'V_VP8';
  try {
    const vp9Result = await VideoEncoder.isConfigSupported({
      codec: 'vp09.00.10.08', width, height, bitrate: 5_000_000, framerate: 30,
    });
    if (vp9Result.supported) { encoderCodec = 'vp09.00.10.08'; muxerVideoCodec = 'V_VP9'; }
  } catch { /* stay with VP8 */ }

  // ── Load the SFX file ───────────────────────────────────────────────────
  // Fetch the ping sound and decode it into raw PCM samples using a temporary
  // AudioContext so we know the exact waveform data.
  const AUDIO_SAMPLE_RATE = 48000;
  let sfxSamples: Float32Array | null = null;
  try {
    const resp = await fetch('/sfx/ping.mp3');
    const buf = await resp.arrayBuffer();
    const tmpCtx = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE });
    const decoded = await tmpCtx.decodeAudioData(buf);
    // Mix to mono
    const mono = new Float32Array(decoded.length);
    for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
      const channelData = decoded.getChannelData(ch);
      for (let i = 0; i < mono.length; i++) mono[i] += channelData[i] / decoded.numberOfChannels;
    }
    sfxSamples = mono;
    await tmpCtx.close();
  } catch (e) {
    console.warn('Could not load ping.mp3, export will be silent:', e);
  }

  // ── Check AudioEncoder support ──────────────────────────────────────────
  let audioEncoderSupported = false;
  try {
    if (typeof AudioEncoder !== 'undefined' && sfxSamples) {
      const res = await AudioEncoder.isConfigSupported({
        codec: 'opus', sampleRate: AUDIO_SAMPLE_RATE, numberOfChannels: 1, bitrate: 64000,
      });
      audioEncoderSupported = !!res.supported;
    }
  } catch { /* no audio encoder */ }

  // ── Set up muxer ────────────────────────────────────────────────────────
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: muxerVideoCodec, width, height },
    ...(audioEncoderSupported ? {
      audio: { codec: 'A_OPUS', sampleRate: AUDIO_SAMPLE_RATE, numberOfChannels: 1 },
    } : {}),
    firstTimestampBehavior: 'offset',
  });

  // ── Video encoder ───────────────────────────────────────────────────────
  let encoderError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      console.error('VideoEncoder error:', e);
      encoderError = e instanceof Error ? e : new Error(String(e));
    },
  });
  encoder.configure({ codec: encoderCodec, width, height, bitrate: 5_000_000, framerate: 30 });

  // ── PASS 1: Record video frames and which frame indices get a ping ───────
  const frameDurationMicros = 33333; // 30 FPS
  let frameIndex = 0;
  const pingSoundAtFrames: number[] = []; // frame indices where a message appears

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Wrap AudioMixer.playSfx to record ping timestamps
  const dummyMixer = {
    playSfx: () => {
      pingSoundAtFrames.push(frameIndex);
      return Promise.resolve();
    },
    playVoiceNote: async () => {},
    close: () => {},
  } as unknown as AudioMixer;

  try {
    if (typeof window !== 'undefined') (window as any).isExportingVideo = true;

    await playMessageSequence({
      ...options,
      audioMixer: dummyMixer,
      includeInitialPause: true,
      includeFinalPause: true,
      fastMode: true,
      onFrame: async () => {
        if (encoderError) throw encoderError;
        try {
          const snap = await toCanvas(element, { pixelRatio, cacheBust: false });
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(snap, 0, 0, width, height);

          const frame = new VideoFrame(canvas, {
            timestamp: frameIndex * frameDurationMicros,
            duration: frameDurationMicros,
          });
          encoder.encode(frame, { keyFrame: frameIndex % 150 === 0 });
          frame.close();
          frameIndex++;

          if (frameIndex % 10 === 0) {
            await new Promise<void>(r => setTimeout(r, 0));
          }
        } catch (err) {
          console.warn('Frame capture skipped:', err);
        }
      },
    });
  } finally {
    if (typeof window !== 'undefined') (window as any).isExportingVideo = false;
  }

  await encoder.flush();
  encoder.close();

  // ── PASS 2: Render audio offline and encode it ──────────────────────────
  if (audioEncoderSupported && sfxSamples && pingSoundAtFrames.length > 0) {
    const totalFrames = frameIndex;
    const totalVideoSeconds = totalFrames / 30;
    const totalAudioSamples = Math.ceil(totalVideoSeconds * AUDIO_SAMPLE_RATE);

    // Build a full-length mono audio buffer with pings at the right positions
    const fullAudio = new Float32Array(totalAudioSamples);
    for (const pingFrame of pingSoundAtFrames) {
      const startSample = Math.round((pingFrame / 30) * AUDIO_SAMPLE_RATE);
      for (let i = 0; i < sfxSamples.length; i++) {
        const idx = startSample + i;
        if (idx < totalAudioSamples) {
          fullAudio[idx] = Math.max(-1, Math.min(1, fullAudio[idx] + sfxSamples[i] * 0.55));
        }
      }
    }

    // Encode in chunks of 1024 samples (Opus frame size)
    const audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => console.warn('AudioEncoder error:', e),
    });
    audioEncoder.configure({
      codec: 'opus',
      sampleRate: AUDIO_SAMPLE_RATE,
      numberOfChannels: 1,
      bitrate: 64000,
    });

    const CHUNK_SIZE = 1024;
    let sampleOffset = 0;
    while (sampleOffset < totalAudioSamples) {
      const chunkLength = Math.min(CHUNK_SIZE, totalAudioSamples - sampleOffset);
      const chunk = fullAudio.slice(sampleOffset, sampleOffset + chunkLength);
      const timestampUs = Math.round((sampleOffset / AUDIO_SAMPLE_RATE) * 1_000_000);

      const audioData = new AudioData({
        format: 'f32',
        sampleRate: AUDIO_SAMPLE_RATE,
        numberOfFrames: chunkLength,
        numberOfChannels: 1,
        timestamp: timestampUs,
        data: chunk,
      });
      audioEncoder.encode(audioData);
      audioData.close();
      sampleOffset += chunkLength;
    }

    await audioEncoder.flush();
    audioEncoder.close();
  }

  // ── Finalize and download ───────────────────────────────────────────────
  muxer.finalize();
  const { buffer } = target;
  const blob = new Blob([buffer], { type: 'video/webm' });
  downloadBlob(blob, 'whatsapp-story.webm');
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT (Legacy) — records the animation via MediaRecorder (real-time speed)
// ─────────────────────────────────────────────────────────────────────────────

async function exportVideoLegacy(options: VideoExportOptions): Promise<void> {
  const { settings, onProgress, elementId = 'whatsapp-preview' } = options;
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);

  const pixelRatio = settings.resolution;
  const width = element.offsetWidth * pixelRatio;
  const height = element.offsetHeight * pixelRatio;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const audioMixer = new AudioMixer(true); // Export mode with MediaStreamDestination
  const audioStream = audioMixer.getStream();

  const canvasStream = canvas.captureStream(30); // 30 fps
  
  const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  if (audioStream) {
    tracks.push(...audioStream.getAudioTracks());
  }
  const combinedStream = new MediaStream(tracks);

  // Pick MIME type
  let mimeType = '';
  if (settings.format === 'mp4') {
    for (const t of [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=h264,aac',
      'video/mp4;codecs=h264',
      'video/mp4;codecs=avc1',
      'video/mp4',
    ]) {
      if (MediaRecorder.isTypeSupported(t)) { mimeType = t; break; }
    }
  }
  if (!mimeType) {
    for (const t of [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ]) {
      if (MediaRecorder.isTypeSupported(t)) { mimeType = t; break; }
    }
  }

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  try {
    if (typeof window !== 'undefined') (window as any).isExportingVideo = true;

    await playMessageSequence({
      ...options,
      audioMixer,
      includeInitialPause: true,
      includeFinalPause: true,
      onFrame: async () => {
        try {
          const snap = await toCanvas(element, { pixelRatio, cacheBust: false });
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(snap, 0, 0, width, height);
        } catch (err) {
          console.warn('Frame capture skipped:', err);
        }
      },
    });

  } finally {
    if (typeof window !== 'undefined') (window as any).isExportingVideo = false;
    recorder.stop();
    audioMixer.close();
  }

  return new Promise<void>((resolve) => {
    recorder.onstop = () => {
      const finalMime = mimeType || 'video/webm';
      const blob = new Blob(chunks, { type: finalMime });
      const actualFormat = finalMime.includes('mp4') ? 'mp4' : 'webm';
      downloadBlob(blob, `whatsapp-story.${actualFormat}`);

      if (settings.format === 'mp4' && actualFormat === 'webm') {
        alert(
          'Your browser does not support native MP4 recording. ' +
          'The video was exported as WebM instead — it plays fine in Chrome, Firefox and VLC.'
        );
      }
      resolve();
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Public export — auto-selects fast (WebCodecs) or legacy (MediaRecorder) path
// ─────────────────────────────────────────────────────────────────────────────

export async function exportVideo(options: VideoExportOptions): Promise<void> {
  // Use fast WebCodecs path when available (Chrome 94+, Edge 94+)
  if (typeof VideoEncoder !== 'undefined') {
    try {
      return await exportVideoFast(options);
    } catch (err) {
      console.warn('Fast export failed, falling back to legacy MediaRecorder:', err);
      // Fall through to legacy path
    }
  }

  // Fallback: legacy MediaRecorder path (Firefox, Safari, older browsers)
  return exportVideoLegacy(options);
}
