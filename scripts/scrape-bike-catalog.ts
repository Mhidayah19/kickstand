import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

interface CatalogEntry {
  make: string;
  model: string;
  engineCc: number | null;
  bikeType: string;
  licenseClass: string;
  imageUrl: string | null;
}

const BASE_URL = 'https://sgbikemart.com.sg/listing/newbikes/listing/';

/**
 * Known make name overrides for slugs that produce incorrect title-casing.
 * Key: lowercase slug segment, Value: correct display name.
 */
const MAKE_OVERRIDES: Record<string, string> = {
  bmw: 'BMW',
  ktm: 'KTM',
  mv: 'MV Agusta',
  cf: 'CFMoto',
  cfmoto: 'CFMoto',
  can: 'Can-Am',
  qj: 'QJ Motor',
  tvs: 'TVS',
  cpi: 'CPI',
  tgb: 'TGB',
  pgo: 'PGO',
  sym: 'SYM',
  bsa: 'BSA',
};

/**
 * Extract make from the URL slug.
 * Slug format: /listing/newbike/{make}-{make}-{model-slug}/{id}/
 * The make is the first hyphen-delimited segment.
 */
function extractMakeFromSlug(slug: string): string {
  // slug example: "honda-honda-adv-150"
  const firstSegment = slug.split('-')[0].toLowerCase();
  if (MAKE_OVERRIDES[firstSegment]) return MAKE_OVERRIDES[firstSegment];
  // Title-case it
  return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
}

async function scrapePage(page: number): Promise<CatalogEntry[]> {
  const url = `${BASE_URL}?bike_model=&bike_type=&price_from=&price_to=&license_class=&page=${page}`;
  console.log(`Scraping page ${page}...`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`HTTP ${res.status} on page ${page}`);
    return [];
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const entries: CatalogEntry[] = [];

  // Each bike is a `.card` with a `.card-title` and `.card-body`
  $('.card').each((_, card) => {
    const titleLink = $(card).find('.card-title a.strong');
    if (!titleLink.length) return;

    const fullTitle = titleLink.text().trim(); // e.g. "Honda ADV 150"
    const href = titleLink.attr('href') || ''; // e.g. "/listing/newbike/honda-honda-adv-150/966/"

    // Extract make from slug
    const slugMatch = href.match(/\/listing\/newbike\/([^/]+)\//);
    let make = '';
    if (slugMatch) {
      make = extractMakeFromSlug(slugMatch[1]);
    }

    // Model is the full title minus the leading make word
    // e.g. "Honda ADV 150" → make="Honda", model="ADV 150"
    let model = fullTitle;
    if (make && fullTitle.toLowerCase().startsWith(make.toLowerCase())) {
      model = fullTitle.slice(make.length).trim();
    }

    // Fall back: if model is empty, use the full title
    if (!model) model = fullTitle;

    // Parse the card-body columns: Type | Engine Capacity | Class
    let bikeType = '';
    let engineCc: number | null = null;
    let licenseClass = '';

    $(card).find('.card-body .row .col').each((_, col) => {
      const label = $(col).find('.smaller').text().trim().toLowerCase();
      const value = $(col).find('strong').text().trim();

      if (label.includes('type')) {
        bikeType = value;
      } else if (label.includes('engine')) {
        const ccMatch = value.match(/(\d+)\s*cc/i);
        engineCc = ccMatch ? parseInt(ccMatch[1], 10) : null;
      } else if (label.includes('class')) {
        licenseClass = value;
      }
    });

    // Normalize license class
    const validClasses = ['2B', '2A', '2'];
    const normalizedClass = validClasses.includes(licenseClass) ? licenseClass : '2';

    // Extract listing image
    const imgSrc = $(card).find('.card-img img').attr('src') || null;
    const imageUrl = imgSrc
      ? `https://sgbikemart.com.sg${imgSrc}`
      : null;

    if (make && model) {
      entries.push({ make, model, engineCc, bikeType, licenseClass: normalizedClass, imageUrl });
    }
  });

  return entries;
}

async function getLastPage(): Promise<number> {
  const url = `${BASE_URL}?bike_model=&bike_type=&price_from=&price_to=&license_class=&page=1`;
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  let lastPage = 1;
  $('a.page-link').each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text === 'last') {
      const href = $(el).attr('href') || '';
      const match = href.match(/page=(\d+)/);
      if (match) lastPage = parseInt(match[1], 10);
    }
  });
  return lastPage;
}

async function scrapeAll() {
  const allEntries: CatalogEntry[] = [];
  const seen = new Set<string>();

  const lastPage = await getLastPage();
  console.log(`Total pages: ${lastPage}`);

  for (let page = 1; page <= lastPage; page++) {
    const entries = await scrapePage(page);
    if (entries.length === 0) {
      console.log(`No entries on page ${page}, stopping.`);
      break;
    }

    for (const entry of entries) {
      const key = `${entry.make}::${entry.model}`;
      if (!seen.has(key)) {
        seen.add(key);
        allEntries.push(entry);
      }
    }

    // Polite delay to avoid hammering the server
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`Scraped ${allEntries.length} unique bikes.`);

  allEntries.sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model));

  const outDir = path.join(__dirname, 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'bike-catalog-seed.json');
  fs.writeFileSync(outPath, JSON.stringify(allEntries, null, 2));
  console.log(`Written to ${outPath}`);
}

scrapeAll().catch(console.error);
