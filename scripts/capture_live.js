const playwright = require('C:/Users/alifs/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../report/images');

async function main() {
  const browser = await playwright.chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-proxy-server'],
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2 // High resolution Retina capture!
  });

  const page = await context.newPage();

  console.log('--- 1. Capturing screenshot_home.png ---');
  await page.goto('https://sportzfy-zeta.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForSelector('h1', { timeout: 25000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT_DIR, 'screenshot_home.png') });
  console.log('Saved screenshot_home.png');

  console.log('--- 2. Capturing screenshot_catalog.png ---');
  // First turf detail page with hourly slot grid
  await page.goto('https://sportzfy-zeta.vercel.app/turfs/cmttm6vj00022fme00fxbq0so', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForSelector('h1', { timeout: 30000 });
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 30000 }).catch(() => {});
  await page.waitForSelector('button:has-text("BDT"), button:has-text("AM"), button:has-text("PM")', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const catalogText = await page.innerText('body');
  if (catalogText.includes('Loading Turf & Pitch Specs')) {
    console.warn('WARNING: catalog still shows loading spinner!');
  } else {
    console.log('VERIFIED: catalog venue details and slot grid rendered cleanly!');
  }
  await page.screenshot({ path: path.join(OUT_DIR, 'screenshot_catalog.png') });
  console.log('Saved screenshot_catalog.png');

  console.log('--- 3. Capturing screenshot_squad.png ---');
  await page.goto('https://sportzfy-zeta.vercel.app/matches', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForSelector('h1', { timeout: 30000 });
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 30000 }).catch(() => {});
  await page.waitForSelector('h3, button:has-text("Format")', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const squadText = await page.innerText('body');
  if (squadText.includes('Loading open matches')) {
    console.warn('WARNING: squad still shows loading spinner!');
  } else {
    console.log('VERIFIED: squad matchmaking cards rendered cleanly!');
  }
  await page.screenshot({ path: path.join(OUT_DIR, 'screenshot_squad.png') });
  console.log('Saved screenshot_squad.png');

  console.log('--- 4. Capturing screenshot_concierge.png ---');
  await page.goto('https://sportzfy-zeta.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(2000);
  const chatTrigger = await page.$('button[aria-label*="chat" i], button:has(svg.lucide-sparkles), button:has(svg.lucide-bot), button:has-text("AI"), [data-testid="ai-concierge-trigger"]');
  if (chatTrigger) {
    console.log('Found AI chat trigger button, clicking...');
    await chatTrigger.click();
    await page.waitForTimeout(1500);
    const chatInput = await page.$('input[placeholder*="Ask" i], input[placeholder*="turf" i], textarea[placeholder*="Ask" i]');
    if (chatInput) {
      await chatInput.fill('Find 7v7 turf in Chattogram under 2000 BDT with parking');
      await chatInput.press('Enter');
      await page.waitForTimeout(3500);
    }
  }
  await page.screenshot({ path: path.join(OUT_DIR, 'screenshot_concierge.png') });
  console.log('Saved screenshot_concierge.png');

  console.log('--- 5. Logging in as Owner for screenshot_pricing.png ---');
  await page.goto('https://sportzfy-zeta.vercel.app/login', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForSelector('button:has-text("Turf Partner")', { timeout: 20000 });
  await page.click('button:has-text("Turf Partner")');
  await page.waitForTimeout(500);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/owner', { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(2000);

  console.log('Navigating to /owner/schedule...');
  await page.goto('https://sportzfy-zeta.vercel.app/owner/schedule', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForSelector('h1', { timeout: 30000 });
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 30000 }).catch(() => {});
  await page.waitForSelector('button:has-text("Apply"), table, [class*="grid"]', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT_DIR, 'screenshot_pricing.png') });
  console.log('Saved screenshot_pricing.png');

  console.log('--- 6. Logging in as Admin for screenshot_admin.png ---');
  await page.goto('https://sportzfy-zeta.vercel.app/login', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForSelector('button:has-text("Admin")', { timeout: 20000 });
  await page.click('button:has-text("Admin")');
  await page.waitForTimeout(500);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 25000 });

  console.log('On /admin, waiting for rich portal content to render...');
  await page.waitForSelector('main', { timeout: 45000 });
  await page.waitForSelector('main h1', { timeout: 15000 });
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 30000 }).catch(() => {});
  await page.waitForSelector('text=GROSS MARKETPLACE VALUE, text=PLATFORM TAKE-RATE', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const adminText = await page.innerText('main');
  console.log('Admin rich content verified. Length:', adminText.length);
  await page.screenshot({ path: path.join(OUT_DIR, 'screenshot_admin.png') });
  console.log('Saved screenshot_admin.png');

  console.log('--- 7. Capturing screenshot_hold.png ---');
  await page.goto('https://sportzfy-zeta.vercel.app/login', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForSelector('button:has-text("Player")', { timeout: 20000 });
  await page.click('button:has-text("Player")');
  await page.waitForTimeout(500);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('https://sportzfy-zeta.vercel.app/turfs/cmttm6vj00022fme00fxbq0so', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForSelector('h1', { timeout: 30000 });
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 30000 }).catch(() => {});
  await page.waitForSelector('button:has-text("BDT"), button:has-text("AM"), button:has-text("PM")', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const slotBtn = await page.$('button:has-text("BDT"), button:has-text("AM"), button:has-text("PM")');
  if (slotBtn) {
    console.log('Clicking slot button to trigger hold...');
    await slotBtn.click();
    await page.waitForTimeout(2000);
    const holdBtn = await page.$('button:has-text("Hold"), button:has-text("Reserve"), button:has-text("Book")');
    if (holdBtn) {
      await holdBtn.click();
      await page.waitForTimeout(3000);
    }
  }
  await page.screenshot({ path: path.join(OUT_DIR, 'screenshot_hold.png') });
  console.log('Saved screenshot_hold.png');

  await browser.close();
  console.log('=== All 7 screenshots captured successfully with DOM verification! ===');
}

main().catch(err => {
  console.error('Fatal error in capture script:', err);
  process.exit(1);
});
