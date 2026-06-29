const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Users/24845/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('console', msg => { if(msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.toString()));

  // Landing page
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '.playwright-mcp/redesign-landing.png', fullPage: false });
  console.log('Landing errors:', JSON.stringify(errors));

  // Scroll down to see features
  await page.evaluate(() => {
    const container = document.querySelector('.overflow-y-auto');
    if (container) container.scrollTop = window.innerHeight;
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '.playwright-mcp/redesign-features.png', fullPage: false });

  // Click to Main page
  const btn = page.locator('button:has-text("开始探索")').first();
  if (await btn.isVisible()) {
    await btn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '.playwright-mcp/redesign-main.png', fullPage: false });
    console.log('Main page errors:', JSON.stringify(errors));
  }

  await browser.close();
})();
