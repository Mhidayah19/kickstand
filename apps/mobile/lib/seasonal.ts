/**
 * Returns the active seasonal callout for a given date, or null.
 * v1: hardcoded Singapore monsoon windows (NE monsoon Dec-Mar,
 * SW monsoon Jun-Sep). Refine with real weather API later.
 */
export interface SeasonalCallout {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: string;
}

export function getActiveSeasonalCallout(now = new Date()): SeasonalCallout | null {
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();

  // NE monsoon: Dec 1 - Mar 15
  if (month === 11 || month === 0 || month === 1 || (month === 2 && day <= 15)) {
    return {
      id: 'ne-monsoon',
      eyebrow: 'SEASONAL · SINGAPORE',
      title: 'Northeast monsoon is on.',
      body: 'Wet roads amplify wear on a dry chain. If your chain is due for lubrication, this week is a good time.',
      icon: 'weather-pouring',
    };
  }

  // SW monsoon: Jun 1 - Sep 30
  if (month >= 5 && month <= 8) {
    return {
      id: 'sw-monsoon',
      eyebrow: 'SEASONAL · SINGAPORE',
      title: 'Southwest monsoon season (Jun–Sep)',
      body: 'Afternoon showers are common this time of year. Worth checking your tyre tread and chain lubrication before the weekend.',
      icon: 'weather-pouring',
    };
  }

  return null;
}
