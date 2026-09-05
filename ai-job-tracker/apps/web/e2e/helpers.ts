import { Page, expect } from '@playwright/test'

export const TEST_USER = {
  email: `test-${Date.now()}@e2e.com`,
  password: 'Test@1234!',
  firstName: 'E2E',
  lastName: 'Test',
}

export const DEMO_USER = {
  email: 'demo@example.com',
  password: 'Demo123!',
}

export async function registerUser(page: Page, user = TEST_USER) {
  await page.goto('/register')
  await page.getByTestId('firstname-input').fill(user.firstName)
  await page.getByTestId('lastname-input').fill(user.lastName)
  await page.getByTestId('email-input').fill(user.email)
  await page.getByTestId('password-input').fill(user.password)
  await page.getByTestId('register-submit').click()
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
}

export async function loginUser(page: Page, user = DEMO_USER) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill(user.email)
  await page.getByTestId('password-input').fill(user.password)
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
}

export async function createApplication(
  page: Page,
  data: {
    company: string
    jobTitle: string
    status?: string
  },
) {
  await page.getByTestId('add-application-btn').click()
  await page.getByTestId('company-input').fill(data.company)
  await page.getByTestId('job-title-input').fill(data.jobTitle)
  if (data.status) {
    await page.getByTestId('status-select').selectOption(data.status)
  }
  await page.getByTestId('submit-application').click()
  // Wait for modal to close
  await expect(page.getByTestId('company-input')).not.toBeVisible({ timeout: 5000 })
}
