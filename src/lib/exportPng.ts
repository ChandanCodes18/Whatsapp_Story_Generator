import { toPng } from 'html-to-image';
import { downloadBlob, dataUrlToBlob } from './utils';

/**
 * Export the phone preview as a high-resolution PNG screenshot.
 * @param elementId - The DOM element ID to capture
 * @param pixelRatio - Resolution multiplier (1x, 2x, 3x)
 * @param filename - Output filename
 */
export async function exportPng(
  elementId: string = 'phone-frame-capture',
  pixelRatio: number = 2,
  filename: string = 'whatsapp-chat.png'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} not found`);
  }

  const dataUrl = await toPng(element, {
    pixelRatio,
    cacheBust: true,
    quality: 1,
    backgroundColor: undefined,
  });

  const blob = dataUrlToBlob(dataUrl);
  downloadBlob(blob, filename);
}
