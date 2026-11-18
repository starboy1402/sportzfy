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
    width: 1200px;
    background: #ffffff;
    border: 1px solid #e1e4e8;
    border-radius: 12px;
    padding: 32px 40px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }
  h2 {
    text-align: center;
    color: #0f172a;
    margin: 0 0 6px 0;
    font-size: 22px;
    font-weight: 700;
  }
  .subtitle {
    text-align: center;
    color: #64748b;
    font-size: 13.5px;
    margin: 0 0 32px 0;
  }
  .workflow-grid {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: relative;
  }
  .phase-card {
    flex: 1;
    background: #f8fafc;
    border: 1.5px solid #cbd5e1;
    border-radius: 10px;
    padding: 18px 14px;
    text-align: center;
    position: relative;
    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    min-height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .phase-card.active {
    background: #f0fdf4;
    border-color: #22c55e;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.12);
  }
  .phase-card.review {
    background: #f0f9ff;
    border-color: #0284c7;
  }
  .phase-card.increment {
    background: #faf5ff;
    border-color: #9333ea;
  }
  .phase-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
    align-self: center;
  }
  .badge-slate { background: #e2e8f0; color: #334155; }
  .badge-green { background: #dcfce7; color: #15803d; }
  .badge-blue  { background: #e0f2fe; color: #0369a1; }
  .badge-purple { background: #f3e8ff; color: #7e22ce; }
  .phase-title {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }
  .phase-desc {
    font-size: 11.5px;
    color: #475569;
    line-height: 1.45;
    text-align: left;
    margin: 0;
    padding-left: 14px;
  }
  .phase-desc li {
    margin-bottom: 4px;
  }
  .arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 20px;
    font-weight: bold;
    flex-shrink: 0;
  }
  .loop-box {
    margin-top: 24px;
    padding: 14px 20px;
    background: #f1f5f9;
    border-radius: 8px;
    border-left: 4px solid #22c55e;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #334155;
  }
  .loop-title {
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sprint-tags {
    display: flex;
    gap: 8px;
  }
  .sprint-tag {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 11px;
    color: #1e293b;
  }
</style>
</head>
<body>
  <div class="container">
    <h2>Agile Scrum Sprint Workflow & Lifecycle Cadence</h2>
    <div class="subtitle">Sportzfy Development Process (5 Bi-Weekly Sprints: 1 September 2026 – 15 November 2026)</div>

    <div class="workflow-grid">
      <!-- Step 1 -->
      <div class="phase-card">
        <span class="phase-badge badge-slate">Input</span>
        <div class="phase-title">Product Backlog</div>
        <ul class="phase-desc">
          <li>User personas & survey</li>
          <li>4 Core architectural pillars</li>
          <li>Proposal SRS requirements</li>
          <li>Epics & user stories</li>
        </ul>
      </div>

      <div class="arrow">➔</div>

      <!-- Step 2 -->
      <div class="phase-card">
        <span class="phase-badge badge-blue">Cadence</span>
        <div class="phase-title">Sprint Planning</div>
        <ul class="phase-desc">
          <li>Bi-weekly sprint goals</li>
          <li>Story point estimation</li>
          <li>Task decomposition</li>
          <li>Sprint Backlog freeze</li>
        </ul>
      </div>

      <div class="arrow">➔</div>

      <!-- Step 3 -->
      <div class="phase-card active">
        <span class="phase-badge badge-green">Execution</span>
        <div class="phase-title">2-Week Sprint Cycle</div>
        <ul class="phase-desc">
          <li>Daily 15-min standups</li>
          <li>Feature branch development</li>
          <li>Prisma schema migrations</li>
          <li>Automated unit tests</li>
        </ul>
      </div>

      <div class="arrow">➔</div>

      <!-- Step 4 -->
      <div class="phase-card review">
        <span class="phase-badge badge-blue">Inspection</span>
        <div class="phase-title">Sprint Review</div>
        <ul class="phase-desc">
          <li>Supervisor live demo</li>
          <li>Prof. Kowsar & Refaj feedback</li>
          <li>Acceptance criteria audit</li>
          <li>Burndown velocity update</li>
        </ul>
      </div>

      <div class="arrow">➔</div>

      <!-- Step 5 -->
      <div class="phase-card increment">
        <span class="phase-badge badge-purple">Deliverable</span>
        <div class="phase-title">Product Increment</div>
        <ul class="phase-desc">
          <li>CI/CD automated pass (36/36)</li>
          <li>Vercel Edge deploy</li>
          <li>Retrospective & refinement</li>
          <li>Production release</li>
        </ul>
      </div>
    </div>

    <div class="loop-box">
      <div class="loop-title">
        <span>🔄 Iterative Execution:</span>
        <span>5 Completed Sprints Delivered On-Schedule</span>
      </div>
      <div class="sprint-tags">
        <span class="sprint-tag">S1: Foundation & ERD</span>
        <span class="sprint-tag">S2: Slot Hold & Locks</span>
        <span class="sprint-tag">S3: AI Pricing & Chat</span>
        <span class="sprint-tag">S4: Matchmaking & QA</span>
        <span class="sprint-tag">S5: Final Polish & Audit</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('temp_scrum.html', html, 'utf8');

  const browser = await playwright.chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-proxy-server'],
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1260, height: 480 }, deviceScaleFactor: 2 });
  await page.goto('file:///' + path.resolve('temp_scrum.html').replace(/\\/g, '/'));
  await page.waitForTimeout(500);
  const element = await page.$('.container');
  await element.screenshot({ path: path.resolve(__dirname, '../report/images/scrum_lifecycle.png') });
  await browser.close();

  fs.unlinkSync('temp_scrum.html');
  console.log('Saved report/images/scrum_lifecycle.png successfully!');
}

main().catch(err => {
  console.error('Error generating scrum lifecycle:', err);
  process.exit(1);
});
