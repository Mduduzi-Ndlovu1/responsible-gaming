// Personalized support module - ResponsibleGaming extension
// Following coding-standards: descriptive names, early returns, error handling

import type { SpendingRecord, UserPattern } from '@shared/types'
import { getSpendingRecords, getSettings, saveSettings } from '@shared/storage'
import { getSessionStats } from '@modules/spending'
import { PRESET_RESOURCES } from '@shared/constants'

export async function analyzeUserPattern(): Promise<UserPattern> {
  try {
    const records = await getSpendingRecords()
    const stats = await getSessionStats()
    const settings = await getSettings()

    const totalSpent = records.reduce((sum, r) => sum + r.amount, 0)

    return {
      totalSpent,
      sessionCount: stats.sessionCount,
      lateNightSessions: stats.lateNightSessions,
      rapidBetEvents: countRapidBetEvents(records)
    }
  } catch (error) {
    console.error('Pattern analysis failed:', error)
    return {
      totalSpent: 0,
      sessionCount: 0,
      lateNightSessions: 0,
      rapidBetEvents: 0
    }
  }
}

export async function getPersonalizedRecommendations(): Promise<string[]> {
  try {
    const pattern = await analyzeUserPattern()
    const settings = await getSettings()
    const recommendations: string[] = []

    if (pattern.totalSpent > 1000) {
      recommendations.push('Consider setting stricter budget limits - you\'ve spent a significant amount recently.')
    }

    if (pattern.sessionCount >= 3) {
      recommendations.push('You\'ve had multiple gambling sessions recently. Consider taking a break.')
    }

    if (pattern.lateNightSessions > 0) {
      recommendations.push('Late-night gambling detected. Set a bedtime reminder to avoid late sessions.')
    }

    if (pattern.rapidBetEvents >= 2) {
      recommendations.push('Rapid betting patterns detected. Consider using the self-exclusion feature.')
    }

    if (settings?.selfExclusionEnabled) {
      recommendations.push('Self-exclusion mode is active. Stay strong!')
    } else if (pattern.rapidBetEvents >= 3) {
      recommendations.push('High-risk betting pattern detected. Consider enabling self-exclusion mode.')
    }

    if (recommendations.length === 0) {
      recommendations.push('You\'re gambling responsibly! Keep up the good habits.')
    }

    return recommendations
  } catch (error) {
    console.error('Recommendation generation failed:', error)
    return ['Unable to generate recommendations at this time.']
  }
}

export async function getRegionSpecificResources(): Promise<Array<{ name: string; url: string }>> {
  try {
    const settings = await getSettings()
    const region = settings?.region ?? 'US'

    const regionResources = PRESET_RESOURCES
      .filter(r => r.region === region || r.region === 'Global')
      .map(r => ({ name: r.name, url: r.url }))

    return regionResources
  } catch (error) {
    console.error('Failed to get regional resources:', error)
    return []
  }
}

export async function enableSelfExclusion(enabled: boolean): Promise<void> {
  try {
    const settings = await getSettings()
    if (!settings) return

    const updatedSettings = {
      ...settings,
      selfExclusionEnabled: enabled
    }

    await saveSettings(updatedSettings)
  } catch (error) {
    console.error('Failed to toggle self-exclusion:', error)
    throw new Error('Self-exclusion toggle failed')
  }
}

export async function isSelfExcluded(): Promise<boolean> {
  try {
    const settings = await getSettings()
    return settings?.selfExclusionEnabled ?? false
  } catch (error) {
    console.error('Failed to check self-exclusion:', error)
    return false
  }
}

function countRapidBetEvents(records: SpendingRecord[]): number {
  const betRecords = records.filter(r => r.type === 'bet')
  let rapidEvents = 0
  const WINDOW_MS = 10 * 60 * 1000
  const THRESHOLD = 3

  for (let i = 0; i < betRecords.length; i++) {
    const current = betRecords[i]
    if (!current) continue

    const windowBets = betRecords.filter(r =>
      r.timestamp >= current.timestamp &&
      r.timestamp <= current.timestamp + WINDOW_MS
    )

    if (windowBets.length >= THRESHOLD) {
      rapidEvents++
    }
  }

  return rapidEvents
}
