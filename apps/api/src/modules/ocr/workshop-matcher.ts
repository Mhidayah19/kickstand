export interface WorkshopLite {
  id: string;
  name: string;
}

export interface WorkshopMatchResult {
  workshopId: string | null;
  confidence: number;
}

const MATCH_THRESHOLD = 0.6;

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): Set<string> {
  return new Set(normalise(s).split(' ').filter(Boolean));
}

function similarity(extracted: Set<string>, workshop: Set<string>): number {
  if (extracted.size === 0 || workshop.size === 0) return 0;
  let intersection = 0;
  for (const t of extracted) if (workshop.has(t)) intersection++;
  // Use average of recall (intersection/workshop size) and precision (intersection/extracted size)
  const recall = intersection / workshop.size;
  const precision = intersection / extracted.size;
  return (recall + precision) / 2;
}

export function matchWorkshop(
  extracted: string,
  workshops: readonly WorkshopLite[],
): WorkshopMatchResult {
  if (!extracted.trim() || workshops.length === 0) {
    return { workshopId: null, confidence: 0 };
  }

  const needle = tokens(extracted);
  let bestId: string | null = null;
  let bestScore = 0;

  for (const w of workshops) {
    const score = similarity(needle, tokens(w.name));
    if (score > bestScore) {
      bestScore = score;
      bestId = w.id;
    }
  }

  return {
    workshopId: bestScore >= MATCH_THRESHOLD ? bestId : null,
    confidence: bestScore,
  };
}
