/**
 * Budget limit configuration for responsible gaming
 */
export interface BudgetLimit {
  daily: number;
  weekly: number;
  monthly: number;
  currency: string;
}

/**
 * Record of a gambling-related financial transaction
 */
export interface SpendingRecord {
  id: string;
  site: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'bet' | 'win';
  timestamp: number;
}

/**
 * Alert configuration for user behavior monitoring
 */
export interface AlertConfig {
  enabled: boolean;
  maxSessionMinutes: number;
  rapidBetThreshold: number;
  rapidBetWindowMs: number;
}

/**
 * Support resource for responsible gaming assistance
 */
export interface SupportResource {
  id: string;
  name: string;
  url: string;
  region: string;
  isCustom: boolean;
}

/**
 * Gambling site domain and detection keywords
 */
export interface GamblingSite {
  domain: string;
  keywords: string[];
}

/**
 * User behavior pattern metrics
 */
export interface UserPattern {
  totalSpent: number;
  sessionCount: number;
  lateNightSessions: number;
  rapidBetEvents: number;
}
