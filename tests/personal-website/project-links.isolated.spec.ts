import {test, expect} from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Go to the starting url before each test.
  await page.goto('https://dohertyalex.cc/projects');
  await page.reload();
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
    if (testInfo.project.name === 'webkit') {
      [sourceCodePage] = await Promise.all([
        page.waitForEvent('popup'),
        link.click()
      ]);

    }
    else{
      [sourceCodePage] = await Promise.all([
        page.context().waitForEvent('page'),
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
        
        expect(sourceCodePage.url()).toContain('github.com/Xela96/personal-website');
        await page.goBack();
    }
  });

});

test.describe('Filter functionality', {
  tag: ['@filter', '@functional'],
}, () => {
  test('valid links are displayed on filtered results', {}, async({ page }, testInfo ) => {    
    await page.locator('#dropdownMenuButton').click();
    await page.locator('.dropdown-item', {hasText: 'Flask'}).click();

    let sourceCodePage;
    if (testInfo.project.name === 'webkit') {
      // Dynamic search so wait for project to appear
      await page.locator('.project-item.show').first().waitFor({ state: 'visible' });
      const link = page.locator('.project-item.show a.btn:has(i.bi-github):has-text("Source code")').first();
      await link.waitFor({ state: 'visible' });

      [sourceCodePage] = await Promise.all([
        page.waitForEvent('popup'),
        link.click()
      ]);

    }
    else{
      [sourceCodePage] = await Promise.all([
        page.waitForEvent('popup'),
        page.locator('a.btn:has(i.bi-github):has-text("Source code")').first().click()
      ]);
    }

    expect(sourceCodePage.url()).toContain('github.com/Xela96/personal-website');        
  });
});