import { test, expect } from '@playwright/test';
import { createProject, createTask, resetDb } from './helpers.js';

test.beforeEach(async ({ request }) => { await resetDb(request); });

test('project view shows kanban columns when tasks exist', async ({ page, request }) => {
  const project = await createProject(request, 'Kanban Project');
  await createTask(request, project.id, { title: 'Sample task', priority: 'medium', category: 'feature' });
  await page.goto(`/projects/${project.id}`);

  await expect(page.getByRole('heading', { name: 'Pending' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'In Progress' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Done' })).toBeVisible();
});

test('project view shows empty state when no tasks exist', async ({ page, request }) => {
  const project = await createProject(request, 'Empty Project');
  await page.goto(`/projects/${project.id}`);

  await expect(page.getByText('No tasks yet. Create one to get started.')).toBeVisible();
});

test('user can create a task and it appears in Pending column', async ({ page, request }) => {
  const project = await createProject(request, 'Task Create Project');
  await page.goto(`/projects/${project.id}`);

  await page.getByRole('button', { name: 'New Task' }).click();
  await page.getByPlaceholder('Task title *').fill('Fix the login bug');
  // selects inside the modal overlay (.fixed.inset-0)
  const modal = page.locator('.fixed.inset-0');
  await modal.locator('select').nth(0).selectOption('high');
  await modal.locator('select').nth(1).selectOption('bug');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Fix the login bug')).toBeVisible();
  await expect(page.getByText('high', { exact: true })).toBeVisible();
  await expect(page.getByText('bug', { exact: true })).toBeVisible();
});

test('clicking status badge advances task to In Progress', async ({ page, request }) => {
  const project = await createProject(request, 'Status Advance Project');
  await createTask(request, project.id, { title: 'Advance me', priority: 'medium', category: 'feature' });
  await page.goto(`/projects/${project.id}`);

  await page.getByRole('button', { name: /Pending →/ }).click();

  await expect(page.getByRole('button', { name: /In Progress →/ })).toBeVisible();
});

test('filter by priority narrows the task list', async ({ page, request }) => {
  const project = await createProject(request, 'Filter Project');
  await createTask(request, project.id, { title: 'High prio task', priority: 'high', category: 'bug' });
  await createTask(request, project.id, { title: 'Low prio task', priority: 'low', category: 'feature' });
  await page.goto(`/projects/${project.id}`);

  await expect(page.getByText('High prio task')).toBeVisible();
  await expect(page.getByText('Low prio task')).toBeVisible();

  await page.locator('select').nth(1).selectOption('high');

  await expect(page.getByText('High prio task')).toBeVisible();
  await expect(page.getByText('Low prio task')).not.toBeVisible();
});

test('empty state message when no tasks match filters', async ({ page, request }) => {
  const project = await createProject(request, 'Empty Filter Project');
  await createTask(request, project.id, { title: 'Some task', priority: 'low', category: 'feature' });
  await page.goto(`/projects/${project.id}`);

  await page.locator('select').nth(0).selectOption('done');

  await expect(page.getByText('No tasks match the active filters.')).toBeVisible();
});

test('clearing filters restores the full task list', async ({ page, request }) => {
  const project = await createProject(request, 'Clear Filter Project');
  await createTask(request, project.id, { title: 'Task A', priority: 'high', category: 'bug' });
  await createTask(request, project.id, { title: 'Task B', priority: 'low', category: 'docs' });
  await page.goto(`/projects/${project.id}`);

  await page.locator('select').nth(1).selectOption('high');
  await expect(page.getByText('Task B')).not.toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).click();

  await expect(page.getByText('Task A')).toBeVisible();
  await expect(page.getByText('Task B')).toBeVisible();
});

test('user can log a work session', async ({ page, request }) => {
  const project = await createProject(request, 'Session Project');
  await page.goto(`/projects/${project.id}`);

  await page.getByRole('button', { name: 'Log Session' }).click();
  await page.locator('input[type="date"]').fill('2026-06-04');
  await page.locator('input[type="number"]').fill('90');
  await page.getByPlaceholder("What did you work on? *").fill('Worked on authentication refactor');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Worked on authentication refactor')).toBeVisible();
  await expect(page.getByText('1h 30m')).toBeVisible();
});
