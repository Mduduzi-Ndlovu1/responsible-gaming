// Options page - ResponsibleGaming extension
// Following coding-standards: descriptive names, early returns, error handling

import { getSettings, saveSettings } from '@shared/storage'
import type { UserSettings } from '@shared/storage'
import { PRESET_RESOURCES, CURRENCY_DEFAULT } from '@shared/constants'

let currentSettings: UserSettings | null = null

document.addEventListener('DOMContentLoaded', () => {
  void initializeOptions()
})

async function initializeOptions(): Promise<void> {
  try {
    currentSettings = await getSettings()
    if (!currentSettings) {
      currentSettings = createDefaultSettings()
    }
    renderOptions()
    setupEventListeners()
  } catch (error) {
    console.error('Failed to initialize options:', error)
    showError('Failed to load settings')
  }
}

function createDefaultSettings(): UserSettings {
  return {
    budget: { daily: 1000, weekly: 5000, monthly: 20000, currency: CURRENCY_DEFAULT },
    alertConfig: { enabled: true, maxSessionMinutes: 120, rapidBetThreshold: 3, rapidBetWindowMs: 600000 },
    region: 'US',
    customResources: [],
    selfExclusionEnabled: false
  }
}

function renderOptions(): void {
  renderBudgetSettings()
  renderAlertSettings()
  renderRegionSettings()
  renderResourceSettings()
}

function renderBudgetSettings(): void {
  const container = document.getElementById('budget-settings')
  if (!container || !currentSettings) return

  container.innerHTML = `
    <h2>Budget Settings</h2>
    <div class="setting-item">
      <label>Daily Limit</label>
      <input type="number" id="opt-daily-limit" value="${currentSettings.budget.daily}" min="0" step="10">
    </div>
    <div class="setting-item">
      <label>Weekly Limit</label>
      <input type="number" id="opt-weekly-limit" value="${currentSettings.budget.weekly}" min="0" step="10">
    </div>
    <div class="setting-item">
      <label>Monthly Limit</label>
      <input type="number" id="opt-monthly-limit" value="${currentSettings.budget.monthly}" min="0" step="10">
    </div>
  `
}

function renderAlertSettings(): void {
  const container = document.getElementById('alert-settings')
  if (!container || !currentSettings) return

  container.innerHTML = `
    <h2>Alert Settings</h2>
    <div class="setting-item">
      <label>Enable Alerts</label>
      <input type="checkbox" id="opt-alerts-enabled" ${currentSettings.alertConfig.enabled ? 'checked' : ''}>
    </div>
    <div class="setting-item">
      <label>Max Session (minutes)</label>
      <input type="number" id="opt-max-session" value="${currentSettings.alertConfig.maxSessionMinutes}" min="0" step="5">
    </div>
  `
}

function renderRegionSettings(): void {
  const container = document.getElementById('region-settings')
  if (!container || !currentSettings) return

  container.innerHTML = `
    <h2>Region Settings</h2>
    <div class="setting-item">
      <label>Select Region</label>
      <select id="opt-region">
        <option value="US" ${currentSettings.region === 'US' ? 'selected' : ''}>United States</option>
        <option value="UK" ${currentSettings.region === 'UK' ? 'selected' : ''}>United Kingdom</option>
        <option value="EU" ${currentSettings.region === 'EU' ? 'selected' : ''}>Europe</option>
        <option value="AU" ${currentSettings.region === 'AU' ? 'selected' : ''}>Australia</option>
        <option value="CA" ${currentSettings.region === 'CA' ? 'selected' : ''}>Canada</option>
      </select>
    </div>
    <div class="setting-item">
      <label>Self-Exclusion Mode</label>
      <input type="checkbox" id="opt-self-exclusion" ${currentSettings.selfExclusionEnabled ? 'checked' : ''}>
    </div>
  `
}

function renderResourceSettings(): void {
  const container = document.getElementById('resources-settings')
  if (!container || !currentSettings) return

  const presetHtml = PRESET_RESOURCES.map((r: { name: string; url: string; region: string }) => `
    <div class="resource-item">
      <a href="${r.url}" target="_blank">${r.name}</a>
      <span class="region-tag">${r.region}</span>
    </div>
  `).join('')

  const customHtml = currentSettings.customResources.map((r: { id: string; name: string; url: string }) => `
    <div class="resource-item" data-id="${r.id}">
      <a href="${r.url}" target="_blank">${r.name}</a>
      <button class="remove-resource" data-id="${r.id}">Remove</button>
    </div>
  `).join('')

  container.innerHTML = `
    <h2>Support Resources</h2>
    <h3>Preset Resources</h3>
    ${presetHtml}
    <h3>Custom Resources</h3>
    ${customHtml}
    <div class="add-resource">
      <input type="text" id="new-resource-name" placeholder="Resource Name">
      <input type="text" id="new-resource-url" placeholder="https://...">
      <button id="add-resource-btn">Add Custom Resource</button>
    </div>
  `
}

function setupEventListeners(): void {
  const saveButton = document.getElementById('save-settings')
  if (saveButton) {
    saveButton.addEventListener('click', handleSaveSettings)
  }

  const addResourceBtn = document.getElementById('add-resource-btn')
  if (addResourceBtn) {
    addResourceBtn.addEventListener('click', handleAddResource)
  }

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('remove-resource')) {
      const id = target.getAttribute('data-id')
      if (id) void handleRemoveResource(id)
    }
  })
}

async function handleSaveSettings(): Promise<void> {
  try {
    if (!currentSettings) return

    const dailyInput = document.getElementById('opt-daily-limit') as HTMLInputElement
    const weeklyInput = document.getElementById('opt-weekly-limit') as HTMLInputElement
    const monthlyInput = document.getElementById('opt-monthly-limit') as HTMLInputElement
    const alertsEnabled = document.getElementById('opt-alerts-enabled') as HTMLInputElement
    const maxSessionInput = document.getElementById('opt-max-session') as HTMLInputElement
    const regionSelect = document.getElementById('opt-region') as HTMLSelectElement
    const selfExclusion = document.getElementById('opt-self-exclusion') as HTMLInputElement

    const updatedSettings: UserSettings = {
      ...currentSettings,
      budget: {
        ...currentSettings.budget,
        daily: Number(dailyInput?.value) || 0,
        weekly: Number(weeklyInput?.value) || 0,
        monthly: Number(monthlyInput?.value) || 0
      },
      alertConfig: {
        ...currentSettings.alertConfig,
        enabled: alertsEnabled?.checked ?? true,
        maxSessionMinutes: Number(maxSessionInput?.value) || 120
      },
      region: regionSelect?.value ?? 'US',
      selfExclusionEnabled: selfExclusion?.checked ?? false
    }

    await saveSettings(updatedSettings)
    currentSettings = updatedSettings
    showSuccess('Settings saved successfully')
  } catch (error) {
    console.error('Failed to save settings:', error)
    showError('Failed to save settings')
  }
}

async function handleAddResource(): Promise<void> {
  try {
    if (!currentSettings) return

    const nameInput = document.getElementById('new-resource-name') as HTMLInputElement
    const urlInput = document.getElementById('new-resource-url') as HTMLInputElement

    if (!nameInput?.value || !urlInput?.value) {
      showError('Please enter both name and URL')
      return
    }

    const newResource = {
      id: Date.now().toString(),
      name: nameInput.value,
      url: urlInput.value,
      region: currentSettings.region,
      isCustom: true
    }

    const updatedSettings: UserSettings = {
      ...currentSettings,
      customResources: [...currentSettings.customResources, newResource]
    }

    await saveSettings(updatedSettings)
    currentSettings = updatedSettings
    renderResourceSettings()
    showSuccess('Custom resource added')
    
    nameInput.value = ''
    urlInput.value = ''
  } catch (error) {
    console.error('Failed to add resource:', error)
    showError('Failed to add resource')
  }
}

async function handleRemoveResource(id: string): Promise<void> {
  try {
    if (!currentSettings) return

    const updatedSettings: UserSettings = {
      ...currentSettings,
      customResources: currentSettings.customResources.filter(r => r.id !== id)
    }

    await saveSettings(updatedSettings)
    currentSettings = updatedSettings
    renderResourceSettings()
    showSuccess('Resource removed')
  } catch (error) {
    console.error('Failed to remove resource:', error)
    showError('Failed to remove resource')
  }
}

function showError(message: string): void {
  showMessage(message, 'error')
}

function showSuccess(message: string): void {
  showMessage(message, 'success')
}

function showMessage(message: string, type: 'error' | 'success'): void {
  const existing = document.getElementById('options-message')
  if (existing) existing.remove()

  const messageEl = document.createElement('div')
  messageEl.id = 'options-message'
  messageEl.className = type
  messageEl.textContent = message
  document.body.prepend(messageEl)

  setTimeout(() => messageEl.remove(), 3000)
}
