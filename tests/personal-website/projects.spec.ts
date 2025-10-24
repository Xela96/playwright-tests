import {test, expect} from '@playwright/test'
import fetch from 'node-fetch';

// Async wait for CI/CD local run of tests that load slower
async function waitForServer(url: string, timeout = 40000) {
  const baseURL = process.env.TEST_TARGET === 'local' ? 'http://web:5000' : 'https://dohertyalex.cc';
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`${baseURL}${url}`);
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Server not responding in time');
}

test.beforeEach(async ({ page }) => {
  await waitForServer('/projects');
  // Go to the starting url before each test.
  await page.goto('/projects');
});

test.describe('Navigation', {
  tag: '@navigation',
}, () => {

  test('Verify that homepage link navigates correctly', {
    tag: ['@smoke', '@functional'],
  }, async ({ page }) => {
    await page.click('text=Home');
    expect(page.url()).toContain('/');
  });

});

test.describe('Filter functionality', {
  tag: ['@filter', '@functional'],
}, () => {

  const projectNames = ['Simulation Engine Test Framework', 'Personal Portfolio Website', 'Automated Fluid Tester']

  test('Verify that filtering for a project by unique technology displays unique project only', {
    tag: ['@smoke']
  }, async({ page }) => {
    
    await page.locator('#dropdownMenuButton').click();
    await page.locator('.dropdown-item', {hasText: 'SpecFlow'}).click();

    await expect(page.getByText('Simulation Engine Test Framework')).toBeVisible();
    await expect(page.getByText('Automated Fluid Tester')).not.toBeVisible();
    await expect(page.getByText('Personal Portfolio Website')).not.toBeVisible();

    await page.locator('#dropdownMenuButton').click();
    await page.getByRole('button', { name: 'Python', exact: true }).click();

    await expect(page.getByText('Simulation Engine Test Framework')).not.toBeVisible();
    await expect(page.getByText('Automated Fluid Tester')).toBeVisible();
    await expect(page.getByText('Personal Portfolio Website')).toBeVisible();
  });

  test('Verify that filtering for showing all projects displays all available projects', {
    tag: ['@smoke']
  }, async({ page }) => {
    
    await page.locator('#dropdownMenuButton').click();
    await page.locator('.dropdown-item', {hasText: 'SpecFlow'}).click();

    await page.locator('#dropdownMenuButton').click();
    await page.locator('.dropdown-item', {hasText: 'Show all'}).click();

    await expect(page.getByText('Simulation Engine Test Framework')).toBeVisible();
    await expect(page.getByText('Automated Fluid Tester')).toBeVisible();
    await expect(page.getByText('Personal Portfolio Website')).toBeVisible();

    await page.locator('#dropdownMenuButton').click();
    await page.getByRole('button', { name: 'Python', exact: true }).click();
    await page.locator('#dropdownMenuButton').click();
    await page.locator('.dropdown-item', {hasText: 'Show all'}).click();

    await expect(page.getByText('Simulation Engine Test Framework')).toBeVisible();
    await expect(page.getByText('Automated Fluid Tester')).toBeVisible();
    await expect(page.getByText('Personal Portfolio Website')).toBeVisible();
  });

});

test.describe('Search functionality', {
  tag: ['@search', '@functional'],
}, () => {

  test('Verify that search for a project by full name displays unique project only', {
    tag: ['@smoke']
  }, async({ page }) => {
    await page.getByRole('textbox').fill('Personal Portfolio Website');
    await page.keyboard.press('Enter') // Required as fill function behaviour doesn't replicate ajax live reaction to text in textbox

    await expect(page.getByText('Simulation Engine Test Framework')).not.toBeVisible();
    await expect(page.getByText('Automated Fluid Tester')).not.toBeVisible();
  });

  test('project search is case insensitive', {}, async({ page }) => {
    await page.getByRole('textbox').fill('simulAtion enGine test FrameWorK');
    await page.keyboard.press('Enter') // Required as fill function behaviour doesn't replicate ajax live reaction to text in textbox

    await expect(page.getByText('Simulation Engine Test Framework')).toBeVisible();
    await expect(page.getByText('Personal Portfolio Website')).not.toBeVisible();
    await expect(page.getByText('Automated Fluid Tester')).not.toBeVisible();
  });

  test('Verify that project search by partial name prefix displays project', {
    tag: ['@smoke']
  }, async({ page }) => {
    await page.getByRole('textbox').fill('simulation eng');
    await page.keyboard.press('Enter') // Required as fill function behaviour doesn't replicate ajax live reaction to text in textbox

    await expect(page.getByText('Simulation Engine Test Framework')).toBeVisible();
    await expect(page.getByText('Personal Portfolio Website')).not.toBeVisible();
    await expect(page.getByText('Automated Fluid Tester')).not.toBeVisible();
  });

  test('Verify that project search by partial name mid-string displays project', {}, async({ page }) => {
    await page.getByRole('textbox').fill('flu');
    await page.keyboard.press('Enter') // Required as fill function behaviour doesn't replicate ajax live reaction to text in textbox

    await expect(page.getByText('Automated Fluid Tester')).toBeVisible();
    await expect(page.getByText('Simulation Engine Test Framework')).not.toBeVisible();
    await expect(page.getByText('Personal Portfolio Website')).not.toBeVisible();

    await page.getByRole('textbox').fill('io');
    await page.keyboard.press('Enter') // Required as fill function behaviour doesn't replicate ajax live reaction to text in textbox
    
    await expect(page.getByRole('heading', { name: 'Simulation Engine Test Framework', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Personal Portfolio Website', level: 2 })).toBeVisible();
    await expect(page.getByText('Automated Fluid Tester')).not.toBeVisible();

  });

});