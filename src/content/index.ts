// Content script - detects gambling sites and injects tracking
// Implements RG-003 gambling site detection
// Following coding-standards: descriptive names, early returns, error handling

import { isGamblingSite, getSiteName } from '@shared/gambling-sites'

function detectGamblingSite(): void {
  try {
    const currentUrl = window.location.href
    const isGambling = isGamblingSite(currentUrl)

    if (!isGambling) return

    const siteName = getSiteName(currentUrl)
    injectBanner(siteName)
    notifyBackground(currentUrl, siteName)
  } catch (error) {
    console.error('Gambling site detection failed:', error)
  }
}

function injectBanner(siteName: string): void {
  const existing = document.getElementById('rg-banner')
  if (existing) return

  const banner = document.createElement('div')
  banner.id = 'rg-banner'
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#4CAF50;color:white;padding:8px;text-align:center;z-index:99999'
  banner.textContent = `ResponsibleGaming: Tracking enabled for ${siteName}`
  document.body?.prepend(banner)
}

function notifyBackground(url: string, siteName: string): void {
  try {
    chrome.runtime.sendMessage({
      type: 'GAMBLING_SITE_DETECTED',
      url,
      siteName
    })
  } catch (error) {
    console.error('Failed to notify background:', error)
  }
}

void detectGamblingSite()
