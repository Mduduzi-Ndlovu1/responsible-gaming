/**
 * Named constants for ResponsibleGaming extension
 * No magic numbers - all values defined here
 */

export const MAX_DAILY_LIMIT = 1000;
export const MAX_WEEKLY_LIMIT = 5000;
export const MAX_MONTHLY_LIMIT = 20000;
export const MAX_SESSION_MINUTES = 120;
export const ALERT_CHECK_INTERVAL_MINUTES = 15;

export const RAPID_BET_THRESHOLD = 3;
export const RAPID_BET_WINDOW_MS = 600000;

export const STORAGE_KEYS = {
  budget: 'budget',
  spending: 'spending',
  alerts: 'alerts',
  resources: 'resources',
} as const;

export const PRESET_RESOURCES = [
  { name: 'GamCare (UK)', url: 'https://www.gamcare.org.uk', region: 'UK' },
  { name: 'NCPG (US)', url: 'https://www.ncpgambling.org', region: 'US' },
  { name: 'Gambling Therapy', url: 'https://www.gamblingtherapy.org', region: 'Global' },
  { name: 'BeGambleAware', url: 'https://www.begambleaware.org', region: 'UK' }
]

export const REMOVE_MESSAGE_DELAY_MS = 3000
export const CURRENCY_DEFAULT = 'USD';
export const SESSION_LATE_NIGHT_START_HOUR = 22;
export const SESSION_LATE_NIGHT_END_HOUR = 6;
