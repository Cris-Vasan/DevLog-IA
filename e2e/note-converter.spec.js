import { test, expect } from '@playwright/test';
import { resetDb } from './helpers.js';

test.beforeEach(async ({ request }) => { await resetDb(request); });

test('Convert to task button is disabled when textarea is empty', async ({ page }) => {
  await page.goto('/convert');

  const btn = page.getByRole('button', { name: 'Convert to task' });
  await expect(btn).toBeDisabled();
});

test('Convert to task button enables once text is entered', async ({ page }) => {
  await page.goto('/convert');

  await page.getByRole('textbox').fill('some note');

  await expect(page.getByRole('button', { name: 'Convert to task' })).toBeEnabled();
});

test('shows error when AI service is not configured (no API key)', async ({ page }) => {
  await page.goto('/convert');

  await page.getByRole('textbox').fill('the auth endpoint crashes on token expiry');
  await page.getByRole('button', { name: 'Convert to task' }).click();

  await expect(page.getByText(/AI conversion is not configured|unavailable|error/i)).toBeVisible({ timeout: 10000 });
});

test('Reset button clears the textarea and error', async ({ page }) => {
  await page.goto('/convert');

  await page.getByRole('textbox').fill('some note');
  await page.getByRole('button', { name: 'Convert to task' }).click();
  await page.getByRole('button', { name: 'Reset' }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: 'Reset' }).click();

  await expect(page.getByRole('textbox')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Convert to task' })).toBeDisabled();
});
