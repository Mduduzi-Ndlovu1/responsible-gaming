// Background service worker - ResponsibleGaming extension
// Handles alarms, tab tracking, and alert notifications
// Following coding-standards: descriptive names, early returns, error handling

import { getSettings } from '@shared/storage'
import { isGamblingSite } from '@shared/gambling-sites'
import { evaluateAndNotify } from '@modules/alerts'

interface ActiveSession {
  tabId: number
  url: string
  startTime: number
}

const activeSessions = new Map<number, ActiveSession>()

chrome.runtime.onInstalled.addListener(() => {
  console.log('ResponsibleGaming extension installed')
  void chrome.alarms.create('check-alerts', { periodInMinutes: 15 })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== 'check-alerts') return
  void checkAlerts()
})

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status !== 'complete') return
  if (!tab.url) return
  void handleTabUpdate(tabId, tab.url)
})

chrome.tabs.onRemoved.addListener((tabId) => {
  void handleTabRemoved(tabId)
})

async function handleTabUpdate(tabId: number, url: string): Promise<void> {
  try {
    const isGambling = isGamblingSite(url)
    if (!isGambling) {
      activeSessions.delete(tabId)
      return
    }

    const existing = activeSessions.get(tabId)
    if (existing) return

    activeSessions.set(tabId, {
      tabId,
      url,
      startTime: Date.now()
    })
  } catch (error) {
    console.error('Tab update handling failed:', error)
  }
}

async function handleTabRemoved(tabId: number): Promise<void> {
  try {
    const session = activeSessions.get(tabId)
    if (!session) return

    activeSessions.delete(tabId)
    await trackSessionEnd(session)
  } catch (error) {
    console.error('Tab removal handling failed:', error)
  }
}

async function trackSessionEnd(session: ActiveSession): Promise<void> {
  try {
    const durationMs = Date.now() - session.startTime
    const settings = await getSettings()
    if (!settings) return

    console.log(`Session ended: ${session.url}, duration: ${durationMs}ms`)
  } catch (error) {
    console.error('Session tracking failed:', error)
  }
}

async function checkAlerts(): Promise<void> {
  try {
    const settings = await getSettings()
    if (!settings) return

    // Alert logic will be implemented in RG-008
    void evaluateAndNotify()
  } catch (error) {
    console.error('Alert check failed:', error)
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GAMBLING_SITE_DETECTED') {
    void handleGamblingSiteDetected(message.url, message.siteName)
    sendResponse({ received: true })
  }
  return true
})

async function handleGamblingSiteDetected(url: string, _siteName: string): Promise<void> {
  try {
    console.log(`Gambling site detected: ${url}`)
  } catch (error) {
    console.error('Failed to handle detected site:', error)
  }
}
