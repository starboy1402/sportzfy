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
    padding: 30px;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .container {
    width: 1280px;
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding: 36px 44px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  }
  h2 {
    text-align: center;
    color: #0f172a;
    margin: 0 0 6px 0;
    font-size: 24px;
    font-weight: 800;
  }
  .subtitle {
    text-align: center;
    color: #64748b;
    font-size: 14px;
    margin: 0 0 32px 0;
  }
  
  /* 4-Layer Horizontal Hierarchy */
  .tier-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
  }

  .tier {
    border-radius: 10px;
    padding: 16px 20px;
    position: relative;
  }

  .tier-label {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 12px;
    display: inline-block;
  }

  /* Tier 1: Actors */
  .tier-actors {
    background: #f8fafc;
    border: 1.5px solid #cbd5e1;
  }
  .actors-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .actor-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .actor-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  .icon-player { background: #dbeafe; color: #1d4ed8; }
  .icon-owner  { background: #dcfce7; color: #15803d; }
  .icon-admin  { background: #fef3c7; color: #b45309; }
  .actor-title {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
  }
  .actor-desc {
    font-size: 11px;
    color: #64748b;
  }

  /* Tier 2: Presentation & Edge Gateway */
  .tier-gateway {
    background: #f0fdf4;
    border: 1.5px solid #86efac;
    text-align: center;
  }
  .gateway-content {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .gw-item {
    font-size: 12.5px;
    font-weight: 600;
    color: #166534;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Tier 3: 4 Core Pillars */
  .tier-pillars {
    background: #f8fafc;
    border: 1.5px solid #94a3b8;
  }
  .pillars-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  .pillar-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 14px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    border-top: 4px solid #3b82f6;
  }
  .pillar-1 { border-top-color: #ef4444; }
  .pillar-2 { border-top-color: #3b82f6; }
  .pillar-3 { border-top-color: #10b981; }
  .pillar-4 { border-top-color: #8b5cf6; }

  .pillar-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 4px;
  }
  .pillar-title {
    font-size: 13.5px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
  }
  .pillar-desc {
    font-size: 11px;
    color: #475569;
    line-height: 1.45;
  }

  /* Tier 4: Cloud Data Tier */
  .tier-db {
    background: #f1f5f9;
    border: 1.5px solid #64748b;
  }
  .db-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .db-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 11.5px;
  }
  .db-name {
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 2px;
  }
  .db-spec {
    color: #64748b;
    font-size: 10.5px;
  }
  .connector {
    text-align: center;
    color: #94a3b8;
    font-size: 14px;
    margin: -10px 0;
  }
</style>
</head>
<body>
  <div class="container">
    <h2>High-Level Platform Ecosystem Architecture</h2>
    <div class="subtitle">Sportzfy: Actors, Edge Gateway, 4 Core Architectural Pillars, and Cloud Infrastructure</div>

    <div class="tier-container">
      <!-- Tier 1: User Actors -->
      <div class="tier tier-actors">
        <span class="tier-label" style="color: #475569;">1. Platform User Personas</span>
        <div class="actors-grid">
          <div class="actor-card">
            <div class="actor-icon icon-player">⚽</div>
            <div>
              <div class="actor-title">Amateur Footballers (Players)</div>
              <div class="actor-desc">Turf discovery, slot holding, digital bKash payments, squad recruitment</div>
            </div>
          </div>
          <div class="actor-card">
            <div class="actor-icon icon-owner">🏟️</div>
            <div>
              <div class="actor-title">Turf Venue Owners</div>
              <div class="actor-desc">168-hour pricing schedules, blocked intervals, revenue payouts, analytics</div>
            </div>
          </div>
          <div class="actor-card">
            <div class="actor-icon icon-admin">🛡️</div>
            <div>
              <div class="actor-title">Platform Administrators</div>
              <div class="actor-desc">Venue approval audits, financial disbursals, dispute mediation, monitoring</div>
            </div>
          </div>
        </div>
      </div>

      <div class="connector">▼ HTTPS / WSS / REST API (Signed HMAC-SHA256 Session Cookies) ▼</div>

      <!-- Tier 2: Presentation & Edge Middleware -->
      <div class="tier tier-gateway">
        <div class="gateway-content">
          <div class="gw-item"><span>⚡</span> Next.js 16.3 App Router (React 19 Server Components)</div>
          <div class="gw-item"><span>🌐</span> Vercel Global Edge Network (Anycast Routing &lt; 50ms)</div>
          <div class="gw-item"><span>🔒</span> Edge RBAC Middleware (Web Crypto Constant-Time HMAC Guard)</div>
          <div class="gw-item"><span>🎨</span> Responsive Tailwind Bento UI &amp; Foodpanda-Style Shelves</div>
        </div>
      </div>

      <div class="connector">▼ Service Invocation &amp; Business Logic Tier ▼</div>

      <!-- Tier 3: 4 Core Pillars -->
      <div class="tier tier-pillars">
        <span class="tier-label" style="color: #334155;">3. Four Core Architectural Pillars</span>
        <div class="pillars-grid">
          <div class="pillar-card pillar-1">
            <div class="pillar-badge">Pillar 1</div>
            <div class="pillar-title">5-Min Slot Hold Lock</div>
            <div class="pillar-desc">
              • Serializable Isolation Level<br>
              • TTL automatic lock expiry<br>
              • Anti-hijacking user bindings<br>
              • Cryptographic QR ticket
            </div>
          </div>

          <div class="pillar-card pillar-2">
            <div class="pillar-badge">Pillar 2</div>
            <div class="pillar-title">Squad Matchmaking</div>
            <div class="pillar-desc">
              • Community player recruitment<br>
              • Tactical position selection<br>
              • Atomic open spot decrementing<br>
              • Fair cost-split calculator
            </div>
          </div>

          <div class="pillar-card pillar-3">
            <div class="pillar-badge">Pillar 3</div>
            <div class="pillar-title">ML Dynamic Pricing</div>
            <div class="pillar-desc">
              • 100-Tree Random Forest ($R^2=0.9887$)<br>
              • Native TypeScript in-process (&lt;0.1ms)<br>
              • Strict [0.80x, 1.30x] safety clamps<br>
              • Bangladesh Standard Time invariant
            </div>
          </div>

          <div class="pillar-card pillar-4">
            <div class="pillar-badge">Pillar 4</div>
            <div class="pillar-title">AI Grounded Concierge</div>
            <div class="pillar-desc">
              • Groq LPU primary (Qwen-3.8-27B)<br>
              • Gemini / deterministic failover<br>
              • Banglish natural language parsing<br>
              • Relational database rich cards
            </div>
          </div>
        </div>
      </div>

      <div class="connector">▼ Prisma ORM 6.19 (Prepared Parameterized Queries) ▼</div>

      <!-- Tier 4: Cloud Data Tier -->
      <div class="tier tier-db">
        <span class="tier-label" style="color: #475569;">4. Cloud Persistence &amp; Database Layer</span>
        <div class="db-grid">
          <div class="db-card">
            <div class="db-name">Neon Serverless PostgreSQL 16</div>
            <div class="db-spec">13 Relational Models (3NF/BCNF) hosted in Singapore AWS (ap-southeast-1)</div>
          </div>
          <div class="db-card">
            <div class="db-name">PgBouncer Connection Pooler</div>
            <div class="db-spec">Session and transaction connection pooling preventing socket starvation</div>
          </div>
          <div class="db-card">
            <div class="db-name">Cloud Blob Storage &amp; CDN</div>
            <div class="db-spec">High-resolution venue photography, user avatars, and digital QR ticket passes</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('temp_overview.html', html, 'utf8');

  const browser = await playwright.chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-proxy-server'],
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1320, height: 750 }, deviceScaleFactor: 2 });
  await page.goto('file:///' + path.resolve('temp_overview.html').replace(/\\/g, '/'));
  await page.waitForTimeout(500);
  const element = await page.$('.container');
  await element.screenshot({ path: path.resolve(__dirname, '../report/images/platform_overview.png') });
  // Also copy to system_overview.png to resolve the duplicate image issue!
  await element.screenshot({ path: path.resolve(__dirname, '../report/images/system_overview.png') });
  await browser.close();

  fs.unlinkSync('temp_overview.html');
  console.log('Saved report/images/platform_overview.png and system_overview.png successfully!');
}

main().catch(err => {
  console.error('Error generating platform overview:', err);
  process.exit(1);
});
