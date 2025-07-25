import {test, expect} from '@playwright/test'


test.beforeEach(async ({ page }) => {
  // Go to the starting url before each test.
  await page.goto('https://dohertyalex.cc/projects');
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
    await page.locator('a.btn:has(i.bi-github)').click();
    expect(page.url()).toContain('github.com/Xela96');
  });

  test('Homepage link navigates correctly', {
    tag: ['@smoke', '@functional'],
  }, async ({ page }) => {
    await page.click('text=Home');
    expect(page.url()).toContain('dohertyalex.cc/');
  });

    test('Projects page link navigates correctly', {
        tag: ['@smoke', '@functional'],
    }, async ({ page }) => {
        await page.click('text=Home');
        expect(page.url()).toContain('dohertyalex.cc/projects');
    });

    test('Source code page links navigate correctly', {
        tag: ['@smoke', '@functional'],
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


    test.describe('Filter functionality', {
      tag: ['@filter', '@functional'],
    }, () => {

      // filter projects by all categories individually & ensure only valid projects are shown
      // show all projects after filtering
      // ensure links show on filtered results
      // ensure links are valid on filtered results



    });

    test.describe('Search functionality', {
      tag: ['@filter', '@functional'],
    }, () => {

      // search for a project by full name
      // search for a project by partial name from start
      // search for a project by partial name from middle
      // ensure links show on search filtered results
      // ensure links are valid on search filtered results

    });


}
)