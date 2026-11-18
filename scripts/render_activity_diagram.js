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

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    justify-content: center;
  }
  .diagram-canvas {
    width: 1280px;
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 12px;
    padding: 26px 30px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.04);
  }
  h2 {
    text-align: center;
    color: #0f172a;
    margin: 0 0 4px 0;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.3px;
  }
  .subtitle {
    text-align: center;
    color: #64748b;
    font-size: 13px;
    margin: 0 0 20px 0;
  }
  .swimlanes {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    align-items: stretch;
  }
  .lane {
    border: 1.5px solid #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
  }
  .lane-player  { border-color: #93c5fd; background: #eff6ff; }
  .lane-gateway { border-color: #c084fc; background: #faf5ff; }
  .lane-lock    { border-color: #86efac; background: #f0fdf4; }
  .lane-db      { border-color: #fed7aa; background: #fffaf5; }

  .lane-header {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    text-align: center;
    margin-bottom: 2px;
    padding-bottom: 6px;
    border-bottom: 1.5px solid rgba(0,0,0,0.08);
  }
  .lane-player .lane-header  { color: #1e40af; }
  .lane-gateway .lane-header { color: #6b21a8; }
  .lane-lock .lane-header    { color: #166534; }
  .lane-db .lane-header      { color: #c2410c; }

  .step-node {
    background: #ffffff;
    border: 1.5px solid #94a3b8;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 11px;
    line-height: 1.45;
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .decision-node {
    background: #fffbeb;
    border: 1.5px solid #f59e0b;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 11px;
    line-height: 1.4;
    color: #78350f;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .error-node {
    background: #fef2f2;
    border: 1.5px solid #ef4444;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 10.5px;
    line-height: 1.4;
    color: #991b1b;
  }
  .success-node {
    background: #f0fdf4;
    border: 1.5px solid #22c55e;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 10.5px;
    line-height: 1.4;
    color: #166534;
  }
  .connector-arrow {
    text-align: center;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    margin: -3px 0;
  }
  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .badge-blue   { background: #dbeafe; color: #1e40af; }
  .badge-purple { background: #f3e8ff; color: #6b21a8; }
  .badge-green  { background: #dcfce7; color: #15803d; }
  .badge-amber  { background: #ffedd5; color: #c2410c; }
</style>
</head>
<body>
  <div class="diagram-canvas">
    <h2>Feature 1: 5-Minute Atomic Slot Hold &amp; Concurrency Defense</h2>
    <div class="subtitle">Horizontal 2D Swimlane Activity Workflow across Client, Edge Gateway, Transaction Lock Engine, and Database</div>
    <div class="swimlanes">
      <!-- Lane 1: Player Client UI -->
      <div class="lane lane-player">
        <div class="lane-header">1. Player Client (Browser)</div>
        <div class="step-node">
          <span class="badge badge-blue">Action</span><br>
          <b>Browse &amp; Select Slot:</b> Player views turf timetable grid and clicks desired hourly slot (e.g., 20:00–21:00).
        </div>
        <div class="connector-arrow">▼ POST /api/v1/holds</div>
        <div class="step-node">
          <span class="badge badge-blue">Awaiting Lock</span><br>
          <b>Pending State:</b> Slot button transitions to optimistic loading spinner; disables duplicate clicks.
        </div>
        <div class="connector-arrow">▼ Lock Granted (HTTP 201)</div>
        <div class="success-node">
          <b>Active 5-Min Hold:</b> Displays animated countdown timer (05:00). Redirects to checkout surface.
        </div>
        <div class="connector-arrow">▼ User Action</div>
        <div class="step-node">
          <b>Payment Submission:</b> Player inputs bKash / Nagad wallet credentials &amp; confirms booking.
        </div>
        <div class="error-node" style="margin-top: 6px;">
          <b>Conflict / Expired:</b> Displays alert banner if slot was held by competitor (409) or TTL elapsed (410).
        </div>
      </div>

      <!-- Lane 2: Next.js Edge Gateway -->
      <div class="lane lane-gateway">
        <div class="lane-header">2. Next.js Edge Gateway</div>
        <div class="step-node">
          <span class="badge badge-purple">Edge Interceptor</span><br>
          <b>Auth &amp; Session Guard:</b> Validates HMAC-SHA256 session token from cookie (constant-time check).
        </div>
        <div class="connector-arrow">▼ Session Valid</div>
        <div class="step-node">
          <span class="badge badge-purple">Payload Sanitization</span><br>
          <b>Interval Validation:</b> Rejects past slots (<code>SLOT_IN_PAST</code>) and intervals &gt;14 days (<code>SLOT_TOO_FAR</code>).
        </div>
        <div class="connector-arrow">▼ Forward to Lock Manager</div>
        <div class="step-node" style="margin-top: 50px;">
          <span class="badge badge-purple">Gateway Dispatch</span><br>
          <b>Response Routing:</b> Returns JSON <code>201 Created</code> with Hold UUID, or handles <code>409 Conflict</code>.
        </div>
        <div class="connector-arrow">▼ Checkout Verification</div>
        <div class="step-node">
          <span class="badge badge-purple">Pre-Payment Gate</span><br>
          <b>Verify Hold Status:</b> Ensures hold record is still <code>ACTIVE</code> and <code>expiresAt &gt; now()</code> before processing charge.
        </div>
      </div>

      <!-- Lane 3: Concurrency Lock Manager -->
      <div class="lane lane-lock">
        <div class="lane-header">3. Concurrency Lock Manager</div>
        <div class="step-node">
          <span class="badge badge-green">Isolation Boundary</span><br>
          <b>Begin Transaction:</b> Executes <code>prisma.$transaction()</code> under <code>SERIALIZABLE</code> isolation level.
        </div>
        <div class="connector-arrow">▼ Overlap Query</div>
        <div class="decision-node">
          <b>Conflicting Active Hold or Booking?</b><br>
          Checks: <code>status = 'ACTIVE' AND expiresAt &gt; now()</code>
        </div>
        <div class="connector-arrow">▼ Slot Free ➔ Insert Hold</div>
        <div class="success-node">
          <b>Acquire Lock:</b> Inserts Hold row with <code>status = 'ACTIVE'</code>, <code>userId = Player</code>, and <code>TTL = 300s</code>.
        </div>
        <div class="connector-arrow">▼ Payment Successful</div>
        <div class="step-node">
          <span class="badge badge-green">Atomic State Upgrade</span><br>
          <b>Convert to Booking:</b> Atomic transition from <code>ACTIVE Hold</code> to <code>CONFIRMED Booking</code> with QR token.
        </div>
      </div>

      <!-- Lane 4: Neon DB & Auto-Release Cron -->
      <div class="lane lane-db">
        <div class="lane-header">4. Neon PostgreSQL &amp; Cron</div>
        <div class="step-node">
          <span class="badge badge-amber">Storage Engine</span><br>
          <b>Row-Level Lock:</b> Acquires row lock in Singapore region pool via PgBouncer.
        </div>
        <div class="connector-arrow">▼ Commit State</div>
        <div class="step-node">
          <span class="badge badge-amber">Hold Table Row</span><br>
          Persists <code>Hold</code> record: UUID pk, slot timestamp, 5-min expiration timestamp, active flag.
        </div>
        <div class="connector-arrow">▼ Background Maintenance</div>
        <div class="step-node" style="margin-top: 30px;">
          <span class="badge badge-amber">Auto-Release Daemon</span><br>
          <b>TTL Cron Sweeper:</b> Periodic background worker queries holds where <code>expiresAt &lt; now()</code>.
        </div>
        <div class="connector-arrow">▼ If Unpaid</div>
        <div class="step-node">
          <span class="badge badge-amber">State Reversion</span><br>
          Sets expired hold to <code>EXPIRED</code>; immediately restores slot to <code>AVAILABLE</code> for platform users.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const tempPath = path.resolve(__dirname, 'temp_activity_diagram.html');
  fs.writeFileSync(tempPath, html, 'utf8');

  const page = await browser.newPage({ viewport: { width: 1340, height: 680 }, deviceScaleFactor: 2 });
  await page.goto('file:///' + tempPath.replace(/\\/g, '/'));
  await page.waitForTimeout(500);

  const element = await page.$('.diagram-canvas');
  const outPath = path.join(OUT_DIR, 'activity_diagram.png');
  await element.screenshot({ path: outPath });
  await browser.close();

  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  console.log(`Rendered balanced activity_diagram.png successfully!`);
}

main().catch(err => {
  console.error('Error rendering activity_diagram:', err);
  process.exit(1);
});
