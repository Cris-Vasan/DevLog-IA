import { test, expect } from '@playwright/test';
import { createProject, resetDb } from './helpers.js';

test.beforeEach(async ({ request }) => { await resetDb(request); });

test('dashboard shows existing projects with task count', async ({ page, request }) => {
  const project = await createProject(request, 'My App', 'A test project');

  await page.goto('/');
  await expect(page.getByText('My App')).toBeVisible();
  await expect(page.getByText('A test project')).toBeVisible();
  await expect(page.getByText('0 tasks')).toBeVisible();
});

test('user can create a new project from the dashboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Project' }).click();
  await page.getByPlaceholder('Project name *').fill('Brand New Project');
  await page.getByPlaceholder('Description (optional)').fill('Created in E2E');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Brand New Project')).toBeVisible();
  await expect(page.getByText('Created in E2E')).toBeVisible();
});

test('clicking a project card navigates to Project View', async ({ page, request }) => {
  const project = await createProject(request, 'Navigate To Me');

  await page.goto('/');
  await page.getByText('Navigate To Me').click();

  await expect(page).toHaveURL(/\/projects\/\d+/);
  await expect(page.getByRole('heading', { name: 'Navigate To Me' })).toBeVisible();
});

test('Note Converter button navigates to /convert', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Note Converter' }).click();

  await expect(page).toHaveURL('/convert');
  await expect(page.getByRole('heading', { name: 'Note Converter' })).toBeVisible();
});
