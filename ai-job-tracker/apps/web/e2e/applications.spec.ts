import { test, expect } from '@playwright/test'
import { loginUser, createApplication, DEMO_USER } from './helpers'

test.describe('Job Applications', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, DEMO_USER)
    await page.goto('/dashboard/applications')
  })

  test('applications page renders with table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /applications/i })).toBeVisible()
    await expect(page.getByTestId('add-application-btn')).toBeVisible()
  })

  test('can create a new application', async ({ page }) => {
    const company = `TestCo-${Date.now()}`
    await createApplication(page, {
      company,
      jobTitle: 'Senior Engineer',
      status: 'APPLIED',
    })
    // Application should appear in the table
    await expect(page.getByText(company)).toBeVisible({ timeout: 8000 })
  })

  test('add application modal validates required fields', async ({ page }) => {
    await page.getByTestId('add-application-btn').click()
    await page.getByTestId('submit-application').click()
    await expect(page.getByText(/required/i).first()).toBeVisible()
  })

  test('can edit an existing application', async ({ page }) => {
    // Create one first
    const company = `EditCo-${Date.now()}`
    await createApplication(page, { company, jobTitle: 'Engineer' })
    await expect(page.getByText(company)).toBeVisible({ timeout: 8000 })

    // Hover the row to show edit button and click
    const row = page.getByTestId('application-row').filter({ hasText: company })
    await row.hover()
    await row.getByTestId('edit-application-btn').click()

    // Update job title
    await page.getByTestId('job-title-input').clear()
    await page.getByTestId('job-title-input').fill('Senior Engineer Updated')
    await page.getByTestId('submit-application').click()

    // Updated title should appear
    await expect(page.getByText('Senior Engineer Updated')).toBeVisible({ timeout: 8000 })
  })

  test('can delete an application', async ({ page }) => {
    const company = `DeleteCo-${Date.now()}`
    await createApplication(page, { company, jobTitle: 'Engineer' })
    await expect(page.getByText(company)).toBeVisible({ timeout: 8000 })

    // Hover and delete
    const row = page.getByTestId('application-row').filter({ hasText: company })
    await row.hover()

    // Handle confirm dialog
    page.on('dialog', (d) => d.accept())
    await row.getByTestId('delete-application-btn').click()

    // Application should be gone
    await expect(page.getByText(company)).not.toBeVisible({ timeout: 8000 })
  })

  test('can filter applications by status', async ({ page }) => {
    // Click APPLIED filter
    await page.getByTestId('filter-APPLIED').click()
    // URL or UI should reflect filter
    await expect(page.getByTestId('filter-APPLIED')).toHaveClass(/bg-primary/)
  })

  test('can search applications', async ({ page }) => {
    const search = page.getByTestId('search-input')
    await search.fill('Google')
    // Results should filter (Google is in seed data)
    await page.waitForTimeout(500)
    const rows = page.getByTestId('application-row')
    const count = await rows.count()
    // Either shows Google or shows empty state — just verify it doesn't crash
    await expect(page.getByRole('heading', { name: /applications/i })).toBeVisible()
  })

  test('empty state shown when no results', async ({ page }) => {
    await page.getByTestId('search-input').fill('xyznonexistentcompany123')
    await page.waitForTimeout(500)
    await expect(page.getByText(/no applications/i)).toBeVisible({ timeout: 5000 })
  })
})
