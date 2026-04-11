import { captureScreen } from 'react-native-view-shot';

const MAX_SCREENSHOTS = 3;

interface ScreenCapture {
  routeName: string;
  base64: string;
  timestamp: number;
}

const buffer: ScreenCapture[] = [];
let currentRoute = '';
let isCapturing = false;

export function getCurrentRoute(): string {
  return currentRoute;
}

export function getNavigationHistory(): string[] {
  return buffer.map((s) => s.routeName);
}

export async function captureAndPush(routeName: string): Promise<void> {
  currentRoute = routeName;

  if (isCapturing) return;
  isCapturing = true;

  const entry: ScreenCapture = { routeName, base64: '', timestamp: Date.now() };
  buffer.push(entry);
  if (buffer.length > MAX_SCREENSHOTS) {
    buffer.shift();
  }

  try {
    entry.base64 = await captureScreen({
      format: 'jpg',
      quality: 0.5,
      result: 'base64',
    });
  } catch {
    // Screenshot failed — route is still tracked in history
  } finally {
    isCapturing = false;
  }
}

export function getScreenshotAttachments(): Array<{
  filename: string;
  data: Uint8Array;
  contentType: string;
}> {
  return buffer
    .filter((capture) => capture.base64)
    .map((capture, i) => ({
      filename: `screen-${i}-${capture.routeName.replace(/[^a-zA-Z0-9]/g, '-')}.jpg`,
      data: base64ToUint8Array(capture.base64),
      contentType: 'image/jpeg',
    }));
}

export function clearScreenshotBuffer(): void {
  buffer.length = 0;
  isCapturing = false;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
