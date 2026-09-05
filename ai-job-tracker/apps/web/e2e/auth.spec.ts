import { test, expect } from '@playwright/test'
import { TEST_USER, DEMO_USER, registerUser, loginUser } from './helpers'

test.describe('Authentication', () => {
  test('landing page shows sign in button', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
  })

  test('user can register', async ({ page }) => {
    const uniqueUser = {
      ...TEST_USER,
      email: `test-${Date.now()}@e2e.com`,
    }
    await registerUser(page, uniqueUser)
    // Should be redirected to dashboard
    await expect(page).toHaveURL('/dashboard')
    // Should show welcome message with first name
    await expect(page.getByText(uniqueUser.firstName)).toBeVisible()
  })

  test('register shows validation errors', async ({ page }) => {
    await page.goto('/register')
    await page.getByTestId('register-submit').click()
    // Should show field errors
    await expect(page.getByText(/required/i).first()).toBeVisible()
  })

  test('user can login with demo account', async ({ page }) => {
    await loginUser(page, DEMO_USER)
    await expect(page).toHaveURL('/dashboard')
  })

  test('login shows error with wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('wrong@example.com')
    await page.getByTestId('password-input').fill('WrongPass123!')
    await page.getByTestId('login-submit').click()
    // Wait for error toast
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 8000 })
  })

  test('user can logout', async ({ page }) => {
    await loginUser(page, DEMO_USER)
    await expect(page).toHaveURL('/dashboard')

    // Find and click logout button
    await page.getByTitle('Log out').click()
    await expect(page).toHaveURL('/login', { timeout: 5000 })
  })

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('forgot password page renders', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByText(/reset password/i)).toBeVisible()
  })
})
