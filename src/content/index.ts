// Content script - detects gambling sites and injects tracking
// Implements RG-003 gambling site detection

const GAMBLING_KEYWORDS = ['bet', 'casino', 'poker', 'slot', 'gambling', 'wager']

function detectGamblingSite(): boolean {
  const hostname = window.location.hostname.toLowerCase()
  const pageText = document.body?.innerText.toLowerCase() ?? ''

  const hasKeyword = GAMBLING_KEYWORDS.some(keyword =>
    hostname.includes(keyword) || pageText.includes(keyword)
  )

  if (hasKeyword) {
    notifyBackground()
  }

  return hasKeyword
}

function notifyBackground(): void {
  void chrome.runtime.sendMessage({ type: 'GAMBLING_SITE_DETECTED', url: window.location.href })
}

void detectGamblingSite()
