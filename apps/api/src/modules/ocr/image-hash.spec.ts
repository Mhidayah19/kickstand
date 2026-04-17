import { sha256OfBytes } from './image-hash';

describe('sha256OfBytes', () => {
  it('returns a hex string of length 64', () => {
    const bytes = Buffer.from('hello');
    expect(sha256OfBytes(bytes)).toMatch(/^[a-f0-9]{64}$/);
  });

  it('returns the known SHA-256 for "hello"', () => {
    const bytes = Buffer.from('hello');
    expect(sha256OfBytes(bytes)).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });

  it('returns the same hash for identical inputs', () => {
    const a = Buffer.from([1, 2, 3, 4]);
    const b = Buffer.from([1, 2, 3, 4]);
    expect(sha256OfBytes(a)).toBe(sha256OfBytes(b));
  });
});
