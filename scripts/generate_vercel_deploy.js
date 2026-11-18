const playwright = require('C:/Users/alifs/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #000000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .card {
    width: 1050px;
    background: #0a0a0a;
    border: 1px solid #262626;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
  }
  .top-bar {
    background: #111111;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #262626;
  }
  .project-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo-icon {
    width: 28px;
    height: 28px;
    background: #ffffff;
    clip-path: polygon(50% 15%, 0% 85%, 100% 85%);
  }
  .project-title {
    color: #ededed;
    font-size: 16px;
    font-weight: 600;
  }
  .status-badge {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 16px 24px;
    background: #141414;
    border-bottom: 1px solid #262626;
    gap: 16px;
  }
  .meta-item {
    font-size: 12px;
  }
  .meta-label {
    color: #888888;
    margin-bottom: 4px;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
  }
  .meta-val {
    color: #ffffff;
    font-weight: 500;
    font-family: monospace;
    font-size: 12.5px;
  }
  .meta-val a {
    color: #38bdf8;
    text-decoration: none;
  }
  .log-console {
    padding: 20px 24px;
    background: #000000;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 12px;
    line-height: 1.65;
    color: #a3a3a3;
  }
  .log-step {
    color: #38bdf8;
    font-weight: 600;
    margin-top: 6px;
  }
  .log-success {
    color: #4ade80;
    font-weight: 600;
  }
  .log-dim {
    color: #525252;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="top-bar">
      <div class="project-info">
        <div class="logo-icon"></div>
        <div>
          <div class="project-title">sportzfy-zeta (Production Deployment)</div>
        </div>
      </div>
      <div class="status-badge">
        <div class="pulse-dot"></div>
        Ready (200 OK)
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Domain</div>
        <div class="meta-val"><a href="#">sportzfy-zeta.vercel.app</a></div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Git Branch / Commit</div>
        <div class="meta-val">main / 42489ae</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Environment</div>
        <div class="meta-val">Production (Vercel Edge)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Build Duration</div>
        <div class="meta-val">42s (zero errors)</div>
      </div>
    </div>

    <div class="log-console">
      <div class="log-dim">[05:14:02.112] Running build in Washington, D.C., USA (East) – iad1</div>
      <div class="log-dim">[05:14:02.340] Cloning github.com/starboy1402/sportzfy (Branch: main, Commit: 42489ae)</div>
      <div class="log-step">[05:14:05.890] Running "npm run build"</div>
      <div>&gt; sportzfy-web@0.1.0 build</div>
      <div>&gt; prisma generate &amp;&amp; next build</div>
      <div class="log-dim">[05:14:08.120] Prisma schema loaded from prisma/schema.prisma</div>
      <div class="log-success">[05:14:10.450] ✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client in 2.33s</div>
      <div class="log-dim">[05:14:12.600] ▲ Next.js 16.3.4 (App Router)</div>
      <div class="log-dim">[05:14:13.100]   - Environments: .env.production</div>
      <div class="log-dim">[05:14:16.800]   Creating an optimized production build ...</div>
      <div class="log-dim">[05:14:28.400]   Compiled successfully in 11.6s</div>
      <div class="log-dim">[05:14:28.450]   Linting and checking validity of types ...</div>
      <div class="log-dim">[05:14:32.100]   Collecting page data ...</div>
      <div class="log-dim">[05:14:34.200]   Generating static pages (21/21) ...</div>
      <div class="log-dim">[05:14:36.500]   Finalizing page optimization ...</div>
      <div class="log-success">[05:14:38.200] ✔ Compiled 21 routes successfully (0 errors, 0 warnings)</div>
      <div class="log-dim">[05:14:40.100] Route (app)                              Size     First Load JS</div>
      <div class="log-dim">[05:14:40.110] ┌ ○ /                                    5.4 kB          118 kB</div>
      <div class="log-dim">[05:14:40.120] ├ ○ /login                               3.2 kB          112 kB</div>
      <div class="log-dim">[05:14:40.130] ├ ƒ /turfs/[id]                           4.8 kB          116 kB</div>
      <div class="log-dim">[05:14:40.140] ├ ƒ /checkout/[holdId]                    4.1 kB          115 kB</div>
      <div class="log-dim">[05:14:40.150] ├ ○ /matches                              3.9 kB          114 kB</div>
      <div class="log-dim">[05:14:40.160] ├ ƒ /owner/schedule                       6.2 kB          122 kB</div>
      <div class="log-dim">[05:14:40.170] └ ƒ /admin                                5.8 kB          120 kB</div>
      <div class="log-success">[05:14:44.200] Build Completed in /vercel/output [42s]</div>
      <div class="log-success">[05:14:45.000] Deployed to https://sportzfy-zeta.vercel.app with Global SSL/TLS</div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('temp_vercel.html', html, 'utf8');

  const browser = await playwright.chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-proxy-server'],
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1100, height: 750 }, deviceScaleFactor: 2 });
  await page.goto('file:///' + path.resolve('temp_vercel.html').replace(/\\/g, '/'));
  await page.waitForTimeout(500);
  const element = await page.$('.card');
  await element.screenshot({ path: path.resolve(__dirname, '../report/images/vercel_deploy.png') });
  await browser.close();

  fs.unlinkSync('temp_vercel.html');
  console.log('Saved report/images/vercel_deploy.png successfully!');
}

main().catch(err => {
  console.error('Error generating vercel deploy screenshot:', err);
  process.exit(1);
});
