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

test.describe('Search functionality', {
  tag: ['@search', '@functional'],
}, () => {

  test('project search displays valid source code links', {}, async({ page }, testInfo) => {
    await page.getByRole('textbox').fill('personal portfolio website');
    await page.keyboard.press('Enter') // Required as fill function behaviour doesn't replicate ajax live reaction to text in textbox

    await expect(page.getByRole('heading', { name: 'Personal Portfolio Website', level: 2 })).toBeVisible();        

    await page.getByText('Source Code');

    let sourceCodePage: { url: () => any; };
    // Dynamic search so wait for project to appear
    await page.locator('.project-item.show').first().waitFor({ state: 'visible' });
    const link = page.locator('.project-item.show a.btn:has(i.bi-github):has-text("Source code")').first();

    await link.waitFor({ state: 'visible' });
    if (testInfo.project.name === 'firefox') {
      [sourceCodePage] = await Promise.all([
        page.context().waitForEvent('page'),
        link.click()
      ]);
    }
    else{
      [sourceCodePage] = await Promise.all([
        page.waitForEvent('popup'),
        link.click()
      ]);
    }
    
    expect(sourceCodePage.url()).toContain('github.com/Xela96/personal-website');

  });

  test('source code page links navigate correctly', {
    tag: ['@smoke'],
  }, async ({ page }) => {
    const sourceCodeButtons = page.getByText('Source Code');
    const buttonsCount = await sourceCodeButtons.count();

    for (let i = 0; i < buttonsCount; i++) {
        const [sourceCodePage] = await Promise.all([
          page.waitForEvent('popup'),
          await sourceCodeButtons.nth(i).click()
        ]);
        
      const url = sourceCodePage.url();
      expect(
        url.includes('github.com/Xela96/personal-website') ||
        url.includes('github.com/Xela96/playwright-tests')
      ).toBe(true);      
      await page.goForward();
    }
  });

});

test.describe('Filter functionality', {
  tag: ['@filter', '@functional'],
}, () => {
  test('valid links are displayed on filtered results', {}, async({ page }, testInfo ) => {    
    await page.locator('#dropdownMenuButton').click();
    await page.locator('.dropdown-item', {hasText: 'Flask'}).click();

    const sourceCodeButtons = page.getByText('Source Code');
    const buttonsCount = await sourceCodeButtons.count();

    let sourceCodePage;
    if (testInfo.project.name === 'webkit') {
      // Dynamic search so wait for project to appear
      await page.locator('.project-item.show').first().waitFor({ state: 'visible' });
      const link = page.locator('.project-item.show a.btn:has(i.bi-github):has-text("Source code")').first();
      await link.waitFor({ state: 'visible' });
      for (let i = 0; i < buttonsCount; i++) {
        [sourceCodePage] = await Promise.all([
          page.waitForEvent('popup'),
          link.click()
        ]);
        const url = sourceCodePage.url();
        expect(url.includes('github.com/Xela96/personal-website')).toBe(true);
        await page.goForward();
      }

    }
    else{
      [sourceCodePage] = await Promise.all([
        page.waitForEvent('popup'),
        page.locator('.project-item.show a.btn:has(i.bi-github):has-text("Source code")').first().click()
      ]);
    }

    expect(sourceCodePage!.url()).toContain('github.com/Xela96/personal-website');        
  });
});