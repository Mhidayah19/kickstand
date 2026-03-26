// ── Brand picker pure logic ──────────────────────────────────────
// Isolated here so it can be unit-tested without React Native native modules.

export const TOP_BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'KTM', 'Triumph'];

export function getDisplayBrands(search: string, makes: string[], topBrands: string[]): string[] {
  if (!search.trim()) return topBrands;
  const lower = search.toLowerCase();
  return makes.filter((b) => b.toLowerCase().includes(lower));
}
