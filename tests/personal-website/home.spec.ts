import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('https://dohertyalex.cc/');
  });

  test('homepage loads and has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Alex Doherty/);

    await page.goto('https://www.dohertyalex.cc/');

    await expect(page).toHaveTitle(/Alex Doherty/);
  });

  test('homepage loads and shows title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Alex Doherty');
  });

  test('name textbox can be used', async ({ page }) => {
    await page.getByRole('textbox', { name: 'name' }).fill('example name');
  });

  test('email textbox can be used', async ({ page }) => {
    await page.getByRole('textbox', { name: 'email' }).fill('example email');
  });

  test('message textbox can be used', async ({ page }) => {
    await page.getByRole('textbox', { name: 'message' }).fill('example message of 20 characters');
  });
});