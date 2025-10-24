import { test, expect } from '@playwright/test';
import { getAccessToken, checkInbox } from 'gmail-getter';
import * as fs from 'fs';
import * as path from 'path';
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
  // Go to the starting url before each test.
  await waitForServer('/');
  await page.goto('/');
});

function decodeBase64Url(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const buff = Buffer.from(base64, 'base64');
  return buff.toString('utf-8');
}
  

test.describe('Navigation', {
  tag: '@navigation',
}, () => {

  test('homepage loads and has correct title', {
    tag: ['@smoke', '@functional'],
  }, async ({ page }) => {
    await expect(page).toHaveTitle(/Alex Doherty/, { timeout: 40000 });

    await page.goto('/', { timeout: 10000 });

    await expect(page).toHaveTitle(/Alex Doherty/, { timeout: 40000 });
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

  test('Projects page link navigates correctly', {
    tag: ['@smoke', '@functional'],
  }, async ({ page }) => {
    await page.click('text=Projects')
    expect(page.url()).toContain('/projects');
  });

});

test.describe('Form validation', {
  tag: ['@form', '@validation'],
}, () => {

  test('name textbox can be used', {
    tag: ['@functional'],
  }, async ({ page }) => {
    await page.getByRole('textbox', { name: 'name' }).fill('example name');
  });

  test('email textbox can be used', {
    tag: ['@functional'],
  }, async ({ page }) => {
    await page.getByRole('textbox', { name: 'email' }).fill('example email');
  });

  test('message textbox can be used', {
    tag: ['@functional'],
  }, async ({ page }) => {
    await page.getByRole('textbox', { name: 'message' }).fill('example message of 20 characters');
  });

  test('name textbox enforces a max length of 40', {
    tag: ['@functional'],
  }, async ({ page }) => {
    await test.step('Fill out contact form fields', async () => {
      await page.getByRole('textbox', { name: 'name' }).fill('this is a test name that is too long over 40 characters');
      await page.getByRole('textbox', { name: 'email' }).fill('validmail@gmail.com');
      await page.getByRole('textbox', { name: 'message' }).fill('example message of 20 characters');
    });

    await expect(page.getByRole('textbox', { name: 'name' })).toHaveValue('this is a test name that is too long ove');
  });

  test('name textbox enforces a min length of 3 characters', {
    tag: ['@functional'],
  }, async ({ page }) => {
    await test.step('Fill out contact form fields', async () => {
      await page.getByRole('textbox', { name: 'name' }).fill('1');
      await page.getByRole('textbox', { name: 'email' }).fill('validmail@gmail.com');
      await page.getByRole('textbox', { name: 'message' }).fill('example message of 20 characters');
    });

    let postRequestTriggered = false;

    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/')) {
        postRequestTriggered = true;
      }
    });

    await page.click('input[value="Send Message"]');

    expect(postRequestTriggered).toBe(false);

    await expect(page.getByRole('textbox', { name: 'name' })).toHaveValue('1');

  });

  test('email textbox enforces a max length of 60', {
    tag: ['@functional'],
  }, async ({ page }) => {
    await test.step('Fill out contact form fields', async () => {
      await page.getByRole('textbox', { name: 'name' }).fill('John Doe');
      await page.getByRole('textbox', { name: 'email' }).fill('this_is_a_test_name_that_is_too_long_over_60_characters@gmail.com');
      await page.getByRole('textbox', { name: 'message' }).fill('example message of 20 characters');
    });

    await expect(page.getByRole('textbox', { name: 'email' })).toHaveValue('this_is_a_test_name_that_is_too_long_over_60_characters@gmai');
  });

  test('email textbox enforces a min length of 3 characters', {
    tag: ['@functional'],
  }, async ({ page }) => {
    await test.step('Fill out contact form fields', async () => {
      await page.getByRole('textbox', { name: 'name' }).fill('John Doe');
      await page.getByRole('textbox', { name: 'email' }).fill('1');
      await page.getByRole('textbox', { name: 'message' }).fill('example message of 20 characters');
    });

    let postRequestTriggered = false;

    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/')) {
        postRequestTriggered = true;
      }
    });

    await page.click('input[value="Send Message"]');

    expect(postRequestTriggered).toBe(false);

    await expect(page.getByRole('textbox', { name: 'email' })).toHaveValue('1');

  });

  test('message textbox enforces a max length of 500', {
    tag: ['@functional'],
  }, async ({ page }) => {
    await test.step('Fill out contact form fields', async () => {
      await page.getByRole('textbox', { name: 'name' }).fill('John Doe');
      await page.getByRole('textbox', { name: 'email' }).fill('validmail@gmail.com');
      await page.getByRole('textbox', { name: 'message' }).fill('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    });

    await expect(page.getByRole('textbox', { name: 'message' })).toHaveValue('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  });

  test('email textbox enforces a min length of 20 characters', {
    tag: ['@functional', '@regression'],
  }, async ({ page }, testInfo) => {
    await test.step('Fill out contact form fields', async () => {
      await page.getByRole('textbox', { name: 'name' }).fill('John Doe');
      await page.getByRole('textbox', { name: 'email' }).fill('validmail@gmail.com');
      await page.getByRole('textbox', { name: 'message' }).fill('less than 20 chars');
    });

    let postRequestTriggered = false;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/')) {
        postRequestTriggered = true;
      }
    });

    await page.click('input[value="Send Message"]');

    // Check that the message field was not cleared
    await expect(page.getByRole('textbox', { name: 'message' }))
      .toHaveValue('less than 20 chars');

    // Only assert that the POST request should not have been sent on Chromium/Firefox
    if (testInfo.project.name === 'chromium' || testInfo.project.name === 'firefox') {
      expect(postRequestTriggered).toBe(false);
    }
  });

});


test.describe('Form submission', {
  tag: '@form',
}, () => {
  
  let accessToken: string;
  test.beforeAll(async () => {
    console.log('Before tests');
    accessToken = fs.readFileSync(
      path.resolve(__dirname, '../../.access_token'),
      'utf-8'
    );
  });
    
  test('valid form submission sends email to correct address', {
    tag: ['@smoke', '@e2e', '@regression'],
  }, async ({ page }) => {
    await test.step('Fill out contact form fields', async () => {
      await page.getByRole('textbox', { name: 'name' }).fill('John Doe');
      await page.getByRole('textbox', { name: 'email' }).fill('validmail@gmail.com');
      await page.getByRole('textbox', { name: 'message' }).fill('Valid message of greater than 20 chars');
    });

    await page.click('input[value="Send Message"]');

    const email = await checkInbox({token: accessToken!,
        timeout: 15000, 
        step: 1500, 
        query: 'from:jbloggo96@gmail.com subject:John Doe'
    });

    expect(email).not.toBeNull()
    
    const body = decodeBase64Url(email.payload.body.data);
    expect(body).toContain('Valid message of greater than 20 chars');
    expect(body).toContain('From: validmail@gmail.com');
    expect(body).toContain('Name: John Doe');
  });

});

test.describe('Downloads', {
  tag: '@downloads',
}, () => {

  test('CV download works', {
    tag: ['@smoke', '@functional'],
  }, async ({ page }) => {
    const path = 'C:\\Users\\User\\source\\repos\\playwright-tests\\CV_AlexDoherty.pdf'
    try{
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Download')
      const download = await downloadPromise;

      const suggestedFilename = download.suggestedFilename();
      await download.saveAs(path);
      
      expect(fs.existsSync(path)).toBe(true);
      expect(suggestedFilename).toBe('CV_AlexDoherty.pdf');
    }
    finally {
      fs.rmSync('C:\\Users\\User\\source\\repos\\playwright-tests\\CV_AlexDoherty.pdf', { force: true });
    }
  });

});