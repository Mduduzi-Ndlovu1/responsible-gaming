// Gambling site detection patterns - ResponsibleGaming extension
// Following coding-standards: descriptive names, early returns

import type { GamblingSite } from './types';

export const KNOWN_GAMBLING_SITES: ReadonlyArray<GamblingSite> = [
  { domain: 'bet365.com', keywords: ['bet', 'sports'] },
  { domain: 'draftkings.com', keywords: ['draft', 'sportsbook'] },
  { domain: 'fanduel.com', keywords: ['fan', 'sportsbook'] },
  { domain: 'pokerstars.com', keywords: ['poker', 'stars'] },
  { domain: '888.com', keywords: ['casino', 'poker', 'sport'] },
  { domain: 'betfair.com', keywords: ['bet', 'exchange'] },
];

const GAMBLING_KEYWORDS = ['bet', 'casino', 'poker', 'slot', 'gambling', 'wager', 'sportsbook', 'bookie'];

const SITE_NAMES: Record<string, string> = {
  'bet365.com': 'Bet365',
  'draftkings.com': 'DraftKings',
  'fanduel.com': 'FanDuel',
  'pokerstars.com': 'PokerStars',
  '888.com': '888',
  'betfair.com': 'Betfair',
};

export function isGamblingSite(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    const isKnownSite = KNOWN_GAMBLING_SITES.some(site =>
      hostname.includes(site.domain)
    );
    if (isKnownSite) return true;

    const hasGamblingKeyword = GAMBLING_KEYWORDS.some(keyword =>
      hostname.includes(keyword)
    );
    if (hasGamblingKeyword) return true;

    return false;
  } catch {
    return false;
  }
}

export function getSiteName(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const knownSite = KNOWN_GAMBLING_SITES.find(site =>
      hostname.includes(site.domain)
    );

    if (!knownSite) return hostname;
    return SITE_NAMES[knownSite.domain] ?? hostname;
  } catch {
    return 'Unknown Site';
  }
}
