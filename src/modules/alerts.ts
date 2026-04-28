// Alert engine - ResponsibleGaming extension
// Following coding-standards: descriptive names, early returns, error handling

import type { BudgetLimit } from '@shared/types'
import { getSettings, getSpendingRecords } from '@shared/storage'
import { getBudget, calculateBudgetUsage } from '@modules/budget'
import { getSessionStats, detectRapidBetting } from '@modules/spending'

export async function checkAllAlerts(): Promise<string[]> {
  try {
    const settings = await getSettings()
    if (!settings?.alertConfig?.enabled) return []

    const alerts: string[] = []

    await checkBudgetAlerts(alerts)
    await checkSessionAlerts(settings, alerts)
    await checkRapidBetAlerts(settings, alerts)

    return alerts
  } catch (error) {
    console.error('Alert check failed:', error)
    return []
  }
}

async function checkBudgetAlerts(alerts: string[]): Promise<void> {
  try {
    const budget = await getBudget()
    const spendingRecords = await getSpendingRecords()
    const usage = calculateBudgetUsage(spendingRecords, budget)

    if (usage.daily.percentage >= 80) {
      alerts.push(`Daily budget at ${usage.daily.percentage.toFixed(0)}% (${usage.daily.spent}/${usage.daily.limit})`)
    }

    if (usage.weekly.percentage >= 80) {
      alerts.push(`Weekly budget at ${usage.weekly.percentage.toFixed(0)}% (${usage.weekly.spent}/${usage.weekly.limit})`)
    }

    if (usage.monthly.percentage >= 80) {
      alerts.push(`Monthly budget at ${usage.monthly.percentage.toFixed(0)}% (${usage.monthly.spent}/${usage.monthly.limit})`)
    }
  } catch (error) {
    console.error('Budget alert check failed:', error)
  }
}

async function checkSessionAlerts(settings: { alertConfig: { maxSessionMinutes: number }; budget: BudgetLimit }, alerts: string[]): Promise<void> {
  try {
    const stats = await getSessionStats()
    const maxMinutes = settings.alertConfig.maxSessionMinutes ?? 120

    if (stats.sessionCount > 0) {
      alerts.push(`You've had ${stats.sessionCount} gambling session(s) recently`)
    }

    if (stats.lateNightSessions > 0) {
      alerts.push(`You've had ${stats.lateNightSessions} late-night session(s) (after 22:00)`)
    }
  } catch (error) {
    console.error('Session alert check failed:', error)
  }
}

async function checkRapidBetAlerts(settings: { alertConfig: { rapidBetThreshold: number }; budget: BudgetLimit }, alerts: string[]): Promise<void> {
  try {
    const spendingRecords = await getSpendingRecords()
    const recentBets = spendingRecords.filter(r =>
      r.type === 'bet' &&
      Date.now() - r.timestamp < 600000 // Last 10 minutes
    )

    const threshold = settings.alertConfig.rapidBetThreshold ?? 3
    if (recentBets.length >= threshold) {
      alerts.push(`Rapid betting detected: ${recentBets.length} bets in 10 minutes`)
    }
  } catch (error) {
    console.error('Rapid bet alert check failed:', error)
  }
}

export async function sendNotification(title: string, message: string): Promise<void> {
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title,
      message
    })
  } catch (error) {
    console.error('Notification failed:', error)
  }
}

export async function evaluateAndNotify(): Promise<void> {
  try {
    const alerts = await checkAllAlerts()

    if (alerts.length === 0) return

    const message = alerts.join('\n')
    await sendNotification('ResponsibleGaming Alert', message)
  } catch (error) {
    console.error('Evaluate and notify failed:', error)
  }
}
