// Pure logic: which brands to show as pills given search input + API makes
import { getDisplayBrands } from '../brand-picker';

const TOP_BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'KTM', 'Triumph'];
const ALL_MAKES = [...TOP_BRANDS, 'Harley-Davidson', 'Royal Enfield', 'CFMoto', 'Benelli'];

describe('getDisplayBrands', () => {
  it('returns TOP_BRANDS when search is empty', () => {
    expect(getDisplayBrands('', ALL_MAKES, TOP_BRANDS)).toEqual(TOP_BRANDS);
  });

  it('returns filtered makes when search has input', () => {
    expect(getDisplayBrands('honda', ALL_MAKES, TOP_BRANDS)).toEqual(['Honda']);
  });

  it('is case-insensitive', () => {
    expect(getDisplayBrands('YAMAHA', ALL_MAKES, TOP_BRANDS)).toEqual(['Yamaha']);
  });

  it('returns empty array when no matches', () => {
    expect(getDisplayBrands('zzz', ALL_MAKES, TOP_BRANDS)).toEqual([]);
  });

  it('returns partial matches', () => {
    const result = getDisplayBrands('al', ALL_MAKES, TOP_BRANDS);
    expect(result).toContain('Royal Enfield');
  });

  it('returns TOP_BRANDS when search is only whitespace', () => {
    expect(getDisplayBrands('   ', ALL_MAKES, TOP_BRANDS)).toEqual(TOP_BRANDS);
  });
});
