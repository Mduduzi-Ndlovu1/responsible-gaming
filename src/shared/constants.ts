/**
 * Named constants for ResponsibleGaming extension
 * No magic numbers - all values defined here
 */

export const MAX_DAILY_LIMIT = 1000;
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

export const CURRENCY_DEFAULT = 'USD';
export const SESSION_LATE_NIGHT_START_HOUR = 22;
export const SESSION_LATE_NIGHT_END_HOUR = 6;
