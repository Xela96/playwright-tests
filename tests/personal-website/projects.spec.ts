import {test, expect} from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Go to the starting url before each test.
  await page.goto('https://dohertyalex.cc/projects');
  await page.evaluate(() => location.reload());
});

test.describe('Navigation', {
  tag: '@navigation',
}, () => {

  test('homepage loads and has correct title', {
    tag: ['@smoke', '@functional'],
  }, async ({ page }) => {
    await expect(page).toHaveTitle(/Alex Doherty/);

    await page.goto('https://www.dohertyalex.cc/');

    await expect(page).toHaveTitle(/Alex Doherty/);
  });

  test('LinkedIn link navigates correctly', {
    tag: ['@smoke', '@functional'],
  }, async ({ page }) => {
    await page.locator('a.btn:has(i.bi-linkedin)').click();
    expect(page.url()).toContain('linkedin.com/in/alex-doherty/');
  });

  test('Github link navigates correctly', {
    tag: ['@smoke', '@functional'],
  }, async ({ page }) => {
    await page.locator('a.btn:has(i.bi-github)').first().click();
    expect(page.url()).toContain('github.com/Xela96');
  });

  test('Homepage link navigates correctly', {
    tag: ['@smoke', '@functional'],
  }, async ({ page }) => {
    await page.click('text=Home');
    expect(page.url()).toContain('dohertyalex.cc/');
  });

  test('Projects page link navigates correctly', {
      tag: ['@functional'],
  }, async ({ page }) => {
      await page.click('text=Projects');
      expect(page.url()).toContain('dohertyalex.cc/projects');
  });

});

test.describe('Filter functionality', {
  tag: ['@filter', '@functional'],
}, () => {

  const projectNames = ['Simulation Engine Test Framework', 'Personal Portfolio Website', 'Automated Fluid Tester']

  test('filter for a project by unique technology displays unique project', {
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

  test('filter for showing all projects displays all available projects', {
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

  test('search for a project by full name', {
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

  test('project search by partial name prefix', {
    tag: ['@smoke']
  }, async({ page }) => {
    await page.getByRole('textbox').fill('simulation eng');
    await page.keyboard.press('Enter') // Required as fill function behaviour doesn't replicate ajax live reaction to text in textbox

    await expect(page.getByText('Simulation Engine Test Framework')).toBeVisible();
    await expect(page.getByText('Personal Portfolio Website')).not.toBeVisible();
    await expect(page.getByText('Automated Fluid Tester')).not.toBeVisible();
  });

  test('project search by partial name mid-string', {}, async({ page }) => {
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