import { matchWorkshop } from './workshop-matcher';

const workshops = [
  { id: 'w1', name: 'Mah Pte Ltd Motorcycle Workshop' },
  { id: 'w2', name: 'Ah Beng Auto Garage' },
  { id: 'w3', name: 'Boon Leng Motors' },
];

describe('matchWorkshop', () => {
  it('returns exact match (case-insensitive)', () => {
    expect(matchWorkshop('mah pte ltd motorcycle workshop', workshops)).toEqual(
      { workshopId: 'w1', confidence: 1 },
    );
  });

  it('returns fuzzy match above threshold', () => {
    // OCR often drops punctuation / suffix words
    const result = matchWorkshop('Mah Motorcycle', workshops);
    expect(result.workshopId).toBe('w1');
    expect(result.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it('returns null workshopId when nothing matches above threshold', () => {
    const result = matchWorkshop('Speedy Rider HQ', workshops);
    expect(result.workshopId).toBeNull();
  });

  it('handles empty extracted name', () => {
    expect(matchWorkshop('', workshops)).toEqual({
      workshopId: null,
      confidence: 0,
    });
  });

  it('handles empty workshop list', () => {
    expect(matchWorkshop('anything', [])).toEqual({
      workshopId: null,
      confidence: 0,
    });
  });
});
