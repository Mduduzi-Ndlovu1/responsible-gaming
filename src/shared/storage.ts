/**
 * Chrome Storage wrapper for ResponsibleGaming extension
 * Follows coding-standards: immutability, error handling, descriptive names, early returns
 */

import type { SpendingRecord } from './types';
import { STORAGE_KEYS } from './constants';

const storage = chrome.storage.local;

/**
 * Retrieve a value from Chrome storage with type safety
 * @returns The stored value or null if not found
 */
export async function get<T>(key: string): Promise<T | null> {
  try {
    const result = await storage.get(key);
    const value = result[key];

    if (value === undefined) {
      return null;
    }

    return value as T;
  } catch (error) {
    console.error(`Failed to get storage key "${key}":`, error);
    throw new Error(`Storage retrieval failed for key: ${key}`);
  }
}

/**
 * Store a value in Chrome storage
 */
export async function set<T>(key: string, value: T): Promise<void> {
  try {
    await storage.set({ [key]: value });
  } catch (error) {
    console.error(`Failed to set storage key "${key}":`, error);
    throw new Error(`Storage save failed for key: ${key}`);
  }
}

/**
 * Append a spending record to the existing records array (immutable)
 */
export async function appendSpending(record: SpendingRecord): Promise<void> {
  try {
    const existingRecords = await get<SpendingRecord[]>(STORAGE_KEYS.spending);
    const updatedRecords = existingRecords
      ? [...existingRecords, record]
      : [record];

    await set<SpendingRecord[]>(STORAGE_KEYS.spending, updatedRecords);
  } catch (error) {
    console.error('Failed to append spending record:', error);
    throw new Error('Spending record append failed');
  }
}
