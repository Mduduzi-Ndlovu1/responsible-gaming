// Background service worker - ResponsibleGaming extension
// Handles alarms, tab tracking, and alert notifications

chrome.runtime.onInstalled.addListener(() => {
  console.log('ResponsibleGaming extension installed')
  void chrome.alarms.create('check-alerts', { periodInMinutes: 15 })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== 'check-alerts') return
  void checkAlerts()
})

async function checkAlerts(): Promise<void> {
  try {
    const budget = await chrome.storage.local.get('budget')
    if (!budget) return
    // Alert logic will be implemented in RG-008
  } catch (error) {
    console.error('Alert check failed:', error)
  }
}
