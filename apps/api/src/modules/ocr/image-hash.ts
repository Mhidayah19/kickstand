import { createHash } from 'crypto';

export function sha256OfBytes(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}
