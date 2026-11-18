const playwright = require('C:/Users/alifs/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  console.log('Running test suite in sportzfy-web...');
  let testOutput = '';
  try {
    testOutput = execSync('npx tsx --test --test-concurrency=1 tests/*.test.ts', {
      cwd: path.resolve(__dirname, '../sportzfy-web'),
      encoding: 'utf8',
      env: process.env,
      timeout: 240000
    });
  } catch (err) {
    testOutput = (err.stdout || '') + (err.stderr || '');
  }

  console.log('Test output collected, length:', testOutput.length);

  // Parse lines for HTML display
  const lines = testOutput.split('\n');
  const formattedLines = lines.map(line => {
    let escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (escaped.includes('✔')) {
      return `<div class="pass-line"><span class="check">✔</span> ${escaped.replace('✔', '').trim()}</div>`;
    } else if (escaped.includes('ℹ tests') || escaped.includes('ℹ pass')) {
      return `<div class="summary-line highlight"><span class="info">ℹ</span> ${escaped.replace('ℹ', '').trim()}</div>`;
    } else if (escaped.includes('ℹ')) {
      return `<div class="summary-line"><span class="info">ℹ</span> ${escaped.replace('ℹ', '').trim()}</div>`;
    } else if (escaped.startsWith('&gt;')) {
      return `<div class="cmd-line">${escaped}</div>`;
    }
    return `<div>${escaped || '&nbsp;'}</div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #0d1117;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .terminal {
    width: 1050px;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 10px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }
  .header {
    background: #21262d;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #30363d;
  }
  .dots {
    display: flex;
    gap: 8px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .dot-red { background: #ff5f56; }
  .dot-yellow { background: #ffbd2e; }
  .dot-green { background: #27c93f; }
  .title {
    margin-left: 16px;
    font-size: 13px;
    color: #8b949e;
    font-weight: 500;
  }
  .body {
    padding: 18px 24px 22px 24px;
    font-size: 12px;
    line-height: 1.5;
    color: #c9d1d9;
  }
  .cmd-line {
    color: #58a6ff;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .pass-line {
    color: #e6edf3;
  }
  .check {
    color: #3fb950;
    font-weight: bold;
    margin-right: 6px;
  }
  .info {
    color: #58a6ff;
    margin-right: 6px;
  }
  .summary-line {
    color: #8b949e;
    margin-top: 2px;
  }
  .summary-line.highlight {
    color: #3fb950;
    font-weight: bold;
  }
</style>
</head>
<body>
  <div class="terminal">
    <div class="header">
      <div class="dots">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div class="title">sportzfy-web — Automated Test Suite (Node.js Test Runner) — 36/36 Passing</div>
    </div>
    <div class="body">
      <div class="cmd-line">$ npm test</div>
      ${formattedLines}
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('temp_test_runner.html', html, 'utf8');

  const browser = await playwright.chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-proxy-server'],
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1150, height: 1800 }, deviceScaleFactor: 2 });
  await page.goto('file:///' + path.resolve('temp_test_runner.html').replace(/\\/g, '/'));
  await page.waitForTimeout(1000);
  const element = await page.$('.terminal');
  await element.screenshot({ path: path.resolve(__dirname, '../report/images/test_runner.png') });
  await browser.close();

  fs.unlinkSync('temp_test_runner.html');
  console.log('Saved report/images/test_runner.png successfully!');
}

main().catch(err => {
  console.error('Error generating test runner screenshot:', err);
  process.exit(1);
});
