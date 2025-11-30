import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

test.describe('UI Fixes - Create Project and Report Bug Menu', () => {
  let authToken: string;
  let testEmail: string;
  let testPassword: string;

  test.beforeAll(async ({ request }) => {
    // Create a test user for testing
    testEmail = `test-${Date.now()}@example.com`;
    testPassword = 'TestPassword123!';

    const registerResponse = await request.post(`${SERVER_URL}/api/auth/register`, {
      data: {
        email: testEmail,
        password: testPassword
      }
    });

    if (registerResponse.ok()) {
      const data = await registerResponse.json();
      authToken = data.token;
    } else {
      // Try to login if user already exists
      const loginResponse = await request.post(`${SERVER_URL}/api/auth/login`, {
        data: {
          email: testEmail,
          password: testPassword
        }
      });
      if (loginResponse.ok()) {
        const data = await loginResponse.json();
        authToken = data.token;
      }
    }
  });

  test.beforeEach(async ({ page, context }) => {
    // Set authentication token in localStorage
    await context.addCookies([{
      name: 'bugspot_token',
      value: authToken,
      domain: new URL(BASE_URL).hostname,
      path: '/'
    }]);

    // Or use localStorage after navigation
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('bugspot_token', token);
    }, authToken);
  });

  test('Create Project button opens modal and creates project', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for dashboard to load
    await page.waitForSelector('text=BugSpot Dashboard', { timeout: 10000 });

    // Check if "No projects found" message is visible
    const noProjectsMessage = page.locator('text=No projects found');
    if (await noProjectsMessage.isVisible()) {
      // Click "Create Project" button
      const createButton = page.locator('button:has-text("Create Project")');
      await expect(createButton).toBeVisible();
      await createButton.click();

      // Wait for modal to appear
      await page.waitForSelector('text=Create New Project', { timeout: 5000 });
      
      // Fill in project name
      const projectNameInput = page.locator('input[placeholder="My Awesome Project"]');
      await expect(projectNameInput).toBeVisible();
      await projectNameInput.fill('Test Project ' + Date.now());

      // Optionally fill in domain
      const domainInput = page.locator('input[placeholder="example.com"]');
      if (await domainInput.isVisible()) {
        await domainInput.fill('test.example.com');
      }

      // Click "Create Project" button in modal
      const createProjectButton = page.locator('button:has-text("Create Project"):not(:has-text("Create New"))');
      await expect(createProjectButton).toBeVisible();
      await createProjectButton.click();

      // Wait for modal to close and project to appear
      await page.waitForSelector('text=Create New Project', { state: 'hidden', timeout: 10000 });
      
      // Verify project appears in the list (either in select or in integration section)
      await page.waitForTimeout(1000); // Give time for UI to update
      
      // Check that "No projects found" is no longer visible
      await expect(noProjectsMessage).not.toBeVisible({ timeout: 5000 });
    } else {
      // If projects already exist, test still passes
      console.log('Projects already exist, skipping creation test');
    }
  });

  test('Report Bug menu does not get cut off on the right side', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for dashboard to load
    await page.waitForSelector('text=BugSpot Dashboard', { timeout: 10000 });

    // Find the Report Bug button (widget button)
    const reportBugButton = page.locator('button:has-text("Report Bug"), .bug-report-widget button');
    await expect(reportBugButton).toBeVisible({ timeout: 10000 });

    // Click to expand menu
    await reportBugButton.click();

    // Wait for menu to appear
    await page.waitForSelector('text=Report Issue', { timeout: 5000 });

    // Get the menu element
    const menu = page.locator('text=Report Issue').locator('..').locator('..');
    
    // Get viewport size
    const viewportSize = page.viewportSize();
    if (viewportSize) {
      // Get menu bounding box
      const menuBox = await menu.boundingBox();
      
      if (menuBox) {
        // Check that menu is not cut off on the right
        // Menu should be within viewport or at least visible
        expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewportSize.width + 10); // 10px tolerance
        
        // Also check that menu is visible (not off-screen)
        const isVisible = await menu.isVisible();
        expect(isVisible).toBe(true);
      }
    }

    // Verify menu items are visible
    await expect(page.locator('text=Report Issue')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('Report Bug menu positioning on different screen sizes', async ({ page }) => {
    // Test on mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    await page.waitForSelector('text=BugSpot Dashboard', { timeout: 10000 });
    
    const reportBugButton = page.locator('button:has-text("Report Bug"), .bug-report-widget button');
    await expect(reportBugButton).toBeVisible({ timeout: 10000 });
    
    await reportBugButton.click();
    await page.waitForSelector('text=Report Issue', { timeout: 5000 });
    
    const menu = page.locator('text=Report Issue').locator('..').locator('..');
    const menuBox = await menu.boundingBox();
    const viewportSize = page.viewportSize();
    
    if (menuBox && viewportSize) {
      // Menu should not exceed viewport width
      expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewportSize.width + 10);
    }

    // Test on tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await page.waitForSelector('text=BugSpot Dashboard', { timeout: 10000 });
    
    const reportBugButtonTablet = page.locator('button:has-text("Report Bug"), .bug-report-widget button');
    await expect(reportBugButtonTablet).toBeVisible({ timeout: 10000 });
    
    await reportBugButtonTablet.click();
    await page.waitForSelector('text=Report Issue', { timeout: 5000 });
    
    const menuTablet = page.locator('text=Report Issue').locator('..').locator('..');
    const menuBoxTablet = await menuTablet.boundingBox();
    const viewportSizeTablet = page.viewportSize();
    
    if (menuBoxTablet && viewportSizeTablet) {
      expect(menuBoxTablet.x + menuBoxTablet.width).toBeLessThanOrEqual(viewportSizeTablet.width + 10);
    }

    // Test on desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    await page.waitForSelector('text=BugSpot Dashboard', { timeout: 10000 });
    
    const reportBugButtonDesktop = page.locator('button:has-text("Report Bug"), .bug-report-widget button');
    await expect(reportBugButtonDesktop).toBeVisible({ timeout: 10000 });
    
    await reportBugButtonDesktop.click();
    await page.waitForSelector('text=Report Issue', { timeout: 5000 });
    
    const menuDesktop = page.locator('text=Report Issue').locator('..').locator('..');
    const menuBoxDesktop = await menuDesktop.boundingBox();
    const viewportSizeDesktop = page.viewportSize();
    
    if (menuBoxDesktop && viewportSizeDesktop) {
      expect(menuBoxDesktop.x + menuBoxDesktop.width).toBeLessThanOrEqual(viewportSizeDesktop.width + 10);
    }
  });

  test('Create Project modal form validation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('text=BugSpot Dashboard', { timeout: 10000 });

    // Try to open create project modal if button exists
    const createButton = page.locator('button:has-text("Create Project")');
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForSelector('text=Create New Project', { timeout: 5000 });

      // Try to submit without name
      const createProjectButton = page.locator('button:has-text("Create Project"):not(:has-text("Create New"))');
      await expect(createProjectButton).toBeDisabled();

      // Fill in name
      const projectNameInput = page.locator('input[placeholder="My Awesome Project"]');
      await projectNameInput.fill('Test Project');
      
      // Button should now be enabled
      await expect(createProjectButton).toBeEnabled();
    }
  });
});

