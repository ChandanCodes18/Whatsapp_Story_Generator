import { delay } from './utils';

export class AudioMixer {
  private ctx: AudioContext | null = null;
  private dest: AudioNode | null = null;
  private isExport: boolean;
  private activeSources: AudioBufferSourceNode[] = [];
  private sfxBuffer: AudioBuffer | null = null;

  constructor(isExport: boolean = false) {
    this.isExport = isExport;
  }

  private streamDest: MediaStreamAudioDestinationNode | null = null;

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    if (this.isExport) {
      this.streamDest = this.ctx.createMediaStreamDestination();
      this.dest = this.streamDest;
    } else {
      this.dest = this.ctx.destination;
    }
  }

  public getStream(): MediaStream | null {
    return this.streamDest ? this.streamDest.stream : null;
  }

  private async loadBuffer(url: string): Promise<AudioBuffer | null> {
    this.init();
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.ctx!.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn(`Failed to load audio: ${url}`, err);
      return null;
    }
  }

  private async loadSfx(): Promise<void> {
    if (this.sfxBuffer) return;
    this.sfxBuffer = await this.loadBuffer('/sfx/ping.mp3');
  }

  public async playSfx() {
    this.init();
    if (this.ctx!.state === 'suspended') await this.ctx!.resume();

    try { await this.loadSfx(); } catch { /* use synth fallback */ }

    if (this.sfxBuffer) {
      const source = this.ctx!.createBufferSource();
      source.buffer = this.sfxBuffer;
      const gain = this.ctx!.createGain();
      gain.gain.value = 0.55;
      source.connect(gain);
      gain.connect(this.dest!);
      source.start();
      this.activeSources.push(source);
    } else {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.dest!);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  }

  public async playVoiceNote(
    url: string,
    durationMs: number,
    onProgress: (percent: number) => void
  ): Promise<void> {
    this.init();
    if (this.ctx!.state === 'suspended') await this.ctx!.resume();

    const buffer = await this.loadBuffer(url);
    if (!buffer) {
      let elapsed = 0;
      while (elapsed < durationMs) {
        onProgress(Math.min(100, (elapsed / durationMs) * 100));
        await delay(33);
        elapsed += 33;
      }
      return;
    }

    return new Promise<void>((resolve) => {
      const source = this.ctx!.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx!.createGain();
      gain.gain.value = 0.95;
      source.connect(gain);
      gain.connect(this.dest!);

      const startTime = this.ctx!.currentTime;
      source.start();
      this.activeSources.push(source);

      const interval = setInterval(() => {
        if (!this.ctx) { clearInterval(interval); resolve(); return; }
        const elapsedMs = (this.ctx.currentTime - startTime) * 1000;
        onProgress(Math.min(99, (elapsedMs / (buffer.duration * 1000)) * 100));
      }, 33);

      source.onended = () => {
        clearInterval(interval);
        onProgress(100);
        resolve();
      };
    });
  }

  public stop() {
    this.activeSources.forEach((src) => { try { src.stop(); } catch { /* ignore */ } });
    this.activeSources = [];
  }

  public close() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.dest = null;
    }
  }
}
