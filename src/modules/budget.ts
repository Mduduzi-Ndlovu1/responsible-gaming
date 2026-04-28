// Budget module - ResponsibleGaming extension
// Following coding-standards: descriptive names, immutability, error handling

import { MAX_DAILY_LIMIT, MAX_WEEKLY_LIMIT, MAX_MONTHLY_LIMIT, CURRENCY_DEFAULT } from '@shared/constants'
import { getSettings, saveSettings } from '@shared/storage'
import type { BudgetLimit } from '@shared/types'

export function createDefaultBudget(): BudgetLimit {
  return {
    daily: MAX_DAILY_LIMIT,
    weekly: MAX_WEEKLY_LIMIT,
    monthly: MAX_MONTHLY_LIMIT,
    currency: CURRENCY_DEFAULT
  }
}

export async function getBudget(): Promise<BudgetLimit> {
  try {
    const settings = await getSettings()
    if (settings?.budget) {
      return { ...settings.budget }
    }
    return createDefaultBudget()
  } catch (error) {
    console.error('Failed to get budget:', error)
    return createDefaultBudget()
  }
}

export async function updateBudget(updates: Partial<BudgetLimit>): Promise<BudgetLimit> {
  try {
    const settings = await getSettings()
    const currentBudget = settings?.budget ?? createDefaultBudget()

    const updatedBudget: BudgetLimit = {
      ...currentBudget,
      ...updates
    }

    const updatedSettings = settings
      ? { ...settings, budget: updatedBudget }
      : { 
          budget: updatedBudget,
          alertConfig: { enabled: true, maxSessionMinutes: 120, rapidBetThreshold: 3, rapidBetWindowMs: 600000 },
          region: 'US',
          customResources: [],
          selfExclusionEnabled: false
        }

    await saveSettings(updatedSettings)
    return updatedBudget
  } catch (error) {
    console.error('Failed to update budget:', error)
    throw new Error('Budget update failed')
  }
}

const HOURS_PER_DAY = 24
const MINUTES_PER_HOUR = 60
const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const MS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND
const DAYS_PER_WEEK = 7
const MIN_BUDGET_PERCENTAGE = 100
const PERCENTAGE_MULTIPLIER = 100

export function calculateBudgetUsage(spendingRecords: Array<{ amount: number; timestamp: number }>, budget: BudgetLimit): {
  daily: { spent: number; limit: number; percentage: number }
  weekly: { spent: number; limit: number; percentage: number }
  monthly: { spent: number; limit: number; percentage: number }
} {
  const now = Date.now()
  const dayMs = MS_PER_DAY
  const weekMs = DAYS_PER_WEEK * dayMs

  const dailySpent = spendingRecords
    .filter(r => now - r.timestamp < dayMs)
    .reduce((sum, r) => sum + r.amount, 0)

  const weeklySpent = spendingRecords
    .filter(r => now - r.timestamp < weekMs)
    .reduce((sum, r) => sum + r.amount, 0)

  const monthlySpent = spendingRecords
    .reduce((sum, r) => sum + r.amount, 0)

  return {
    daily: {
      spent: dailySpent,
      limit: budget.daily,
      percentage: Math.min(MIN_BUDGET_PERCENTAGE, (dailySpent / budget.daily) * PERCENTAGE_MULTIPLIER)
    },
    weekly: {
      spent: weeklySpent,
      limit: budget.weekly,
      percentage: Math.min(MIN_BUDGET_PERCENTAGE, (weeklySpent / budget.weekly) * PERCENTAGE_MULTIPLIER)
    },
    monthly: {
      spent: monthlySpent,
      limit: budget.monthly,
      percentage: Math.min(MIN_BUDGET_PERCENTAGE, (monthlySpent / budget.monthly) * PERCENTAGE_MULTIPLIER)
    }
  }
}
