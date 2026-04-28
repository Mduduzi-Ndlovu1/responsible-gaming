// Popup UI - ResponsibleGaming extension
// Following coding-standards: descriptive names, early returns, error handling

import { getBudget, updateBudget, calculateBudgetUsage } from '@modules/budget'
import type { BudgetLimit } from '@shared/types'
import { REMOVE_MESSAGE_DELAY_MS } from '@shared/constants'

let currentBudget: BudgetLimit | null = null

document.addEventListener('DOMContentLoaded', () => {
  void initializePopup()
})

async function initializePopup(): Promise<void> {
  try {
    currentBudget = await getBudget()
    renderBudgetDisplay()
    setupEventListeners()
  } catch (error) {
    console.error('Failed to initialize popup:', error)
    showError('Failed to load budget settings')
  }
}

function renderBudgetDisplay(): void {
  const container = document.getElementById('budget-display')
  if (!container || !currentBudget) return

  const usage = calculateBudgetUsage([], currentBudget)

  container.innerHTML = `
    <h2>Budget Limits</h2>
    <div class="budget-item">
      <label>Daily Limit</label>
      <input type="number" id="daily-limit" value="${currentBudget.daily}" min="0" step="10">
      <span class="currency">${currentBudget.currency}</span>
      <div class="progress-bar">
        <div class="progress" style="width: ${usage.daily.percentage}%"></div>
      </div>
      <span class="usage">${usage.daily.spent} / ${usage.daily.limit}</span>
    </div>
    <div class="budget-item">
      <label>Weekly Limit</label>
      <input type="number" id="weekly-limit" value="${currentBudget.weekly}" min="0" step="10">
      <span class="currency">${currentBudget.currency}</span>
      <div class="progress-bar">
        <div class="progress" style="width: ${usage.weekly.percentage}%"></div>
      </div>
      <span class="usage">${usage.weekly.spent} / ${usage.weekly.limit}</span>
    </div>
    <div class="budget-item">
      <label>Monthly Limit</label>
      <input type="number" id="monthly-limit" value="${currentBudget.monthly}" min="0" step="10">
      <span class="currency">${currentBudget.currency}</span>
      <div class="progress-bar">
        <div class="progress" style="width: ${usage.monthly.percentage}%"></div>
      </div>
      <span class="usage">${usage.monthly.spent} / ${usage.monthly.limit}</span>
    </div>
  `
}

function setupEventListeners(): void {
  const saveButton = document.getElementById('save-budget')
  if (!saveButton) return
  saveButton.addEventListener('click', handleSaveBudget)
}

async function handleSaveBudget(): Promise<void> {
  try {
    const dailyInput = document.getElementById('daily-limit') as HTMLInputElement
    const weeklyInput = document.getElementById('weekly-limit') as HTMLInputElement
    const monthlyInput = document.getElementById('monthly-limit') as HTMLInputElement

    if (!dailyInput || !weeklyInput || !monthlyInput) return

    const updates = {
      daily: Number(dailyInput.value) || 0,
      weekly: Number(weeklyInput.value) || 0,
      monthly: Number(monthlyInput.value) || 0
    }

    currentBudget = await updateBudget(updates)
    renderBudgetDisplay()
    showSuccess('Budget updated successfully')
  } catch (error) {
    console.error('Failed to save budget:', error)
    showError('Failed to save budget')
  }
}

function showError(message: string): void {
  showMessage(message, 'error')
}

function showSuccess(message: string): void {
  showMessage(message, 'success')
}

function showMessage(message: string, type: 'error' | 'success'): void {
  const existing = document.getElementById('message')
  if (existing) existing.remove()

  const messageEl = document.createElement('div')
  messageEl.id = 'message'
  messageEl.className = type
  messageEl.textContent = message
  document.body.prepend(messageEl)

  setTimeout(() => messageEl.remove(), REMOVE_MESSAGE_DELAY_MS)
}
