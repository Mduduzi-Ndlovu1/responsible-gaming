// Spending tracker module - ResponsibleGaming extension
// Following coding-standards: descriptive names, immutability, error handling

import type { SpendingRecord } from '@shared/types'
import { getSpendingRecords, appendSpending, getSettings } from '@shared/storage'
import { SESSION_LATE_NIGHT_START_HOUR, SESSION_LATE_NIGHT_END_HOUR, RAPID_BET_WINDOW_MS, RAPID_BET_THRESHOLD } from '@shared/constants'

export async function recordSpending(
  siteUrl: string,
  siteName: string,
  amount: number,
  type: 'deposit' | 'withdraw' | 'bet' | 'win'
): Promise<SpendingRecord> {
  try {
    const record: SpendingRecord = {
      id: generateId(),
      site: siteName,
      amount,
      type,
      timestamp: Date.now()
    }

    await appendSpending(record)
    return record
  } catch (error) {
    console.error('Failed to record spending:', error)
    throw new Error('Spending record failed')
  }
}

export async function getSessionStats(): Promise<{
  today: number
  thisWeek: number
  thisMonth: number
  sessionCount: number
  lateNightSessions: number
}> {
  try {
    const records = await getSpendingRecords()
    const MS_PER_DAY = 24 * 60 * 60 * 1000
    const DAYS_PER_WEEK = 7
    const now = Date.now()
    const dayMs = MS_PER_DAY
    const weekMs = DAYS_PER_WEEK * dayMs

    const todaySpent = records
      .filter((r: SpendingRecord) => now - r.timestamp < dayMs)
      .reduce((sum: number, r: SpendingRecord) => sum + r.amount, 0)

    const weekSpent = records
      .filter((r: SpendingRecord) => now - r.timestamp < weekMs)
      .reduce((sum: number, r: SpendingRecord) => sum + r.amount, 0)

    const monthSpent = records
      .reduce((sum: number, r: SpendingRecord) => sum + r.amount, 0)

    const sessions = groupIntoSessions(records)
    const lateNightSessions = sessions.filter((s: { start: number }) => isLateNightSession(s)).length

    return {
      today: todaySpent,
      thisWeek: weekSpent,
      thisMonth: monthSpent,
      sessionCount: sessions.length,
      lateNightSessions
    }
  } catch (error) {
    console.error('Failed to get session stats:', error)
    return {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      sessionCount: 0,
      lateNightSessions: 0
    }
  }
}

export async function detectRapidBetting(siteName: string): Promise<boolean> {
  try {
    const settings = await getSettings()
    if (!settings?.alertConfig) return false

    const records = await getSpendingRecords()
    const now = Date.now()
    const windowMs = settings.alertConfig.rapidBetWindowMs ?? RAPID_BET_WINDOW_MS

    const recentBets = records.filter(r =>
      r.site === siteName &&
      r.type === 'bet' &&
      now - r.timestamp < windowMs
    )

    return recentBets.length >= (settings.alertConfig.rapidBetThreshold ?? RAPID_BET_THRESHOLD)
  } catch (error) {
    console.error('Failed to detect rapid betting:', error)
    return false
  }
}

function groupIntoSessions(records: SpendingRecord[]): Array<{ start: number; end: number }> {
  if (records.length === 0) return []

  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp)
  const sessions: Array<{ start: number; end: number }> = []
  if (!sorted[0]) return []

  let currentSession = { start: sorted[0].timestamp, end: sorted[0].timestamp }
  if (!sorted[0]) return []

  const SESSION_GAP_MS = 30 * 60 * 1000

  for (const record of sorted) {
    if (record.timestamp - currentSession.end > SESSION_GAP_MS) {
      sessions.push(currentSession)
      currentSession = { start: record.timestamp, end: record.timestamp }
    } else {
      currentSession.end = Math.max(currentSession.end, record.timestamp)
    }
  }

  sessions.push(currentSession)
  return sessions
}

function isLateNightSession(session: { start: number }): boolean {
  const hour = new Date(session.start).getHours()
  return hour >= SESSION_LATE_NIGHT_START_HOUR || hour < SESSION_LATE_NIGHT_END_HOUR
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
