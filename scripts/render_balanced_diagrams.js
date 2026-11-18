const playwright = require('C:/Users/alifs/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../report/images');

async function renderCard(browser, html, width, height, outputPath) {
  const tempPath = path.resolve(__dirname, 'temp_diagram.html');
  fs.writeFileSync(tempPath, html, 'utf8');
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto('file:///' + tempPath.replace(/\\/g, '/'));
  await page.waitForTimeout(500);
  const element = await page.$('.diagram-canvas');
  await element.screenshot({ path: outputPath });
  await page.close();
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  console.log(`Rendered: ${path.basename(outputPath)} (${width}x${height})`);
}

async function main() {
  const browser = await playwright.chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-proxy-server'],
    headless: true
  });

  // =========================================================================
  // 1. Balanced Master System Use Case Diagram (usecase_diagram.png)
  // =========================================================================
  const useCaseHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 24px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; }
  .diagram-canvas { width: 1260px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 28px 36px; box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
  h2 { text-align: center; color: #0f172a; margin: 0 0 4px 0; font-size: 20px; font-weight: 800; }
  .subtitle { text-align: center; color: #64748b; font-size: 13px; margin: 0 0 24px 0; }
  .actors-layout { display: grid; grid-template-columns: 240px 1fr 240px; gap: 24px; align-items: center; }
  .actor-col { display: flex; flex-direction: column; gap: 16px; align-items: center; }
  .actor-box { background: #f8fafc; border: 1.5px solid #94a3b8; border-radius: 10px; padding: 16px; text-align: center; width: 100%; box-shadow: 0 2px 6px rgba(0,0,0,0.03); }
  .actor-box.player { border-color: #3b82f6; background: #eff6ff; }
  .actor-box.owner  { border-color: #10b981; background: #ecfdf5; }
  .actor-box.admin  { border-color: #f59e0b; background: #fffbeb; }
  .actor-icon { font-size: 32px; margin-bottom: 6px; }
  .actor-name { font-weight: 700; font-size: 14px; color: #1e293b; }
  .actor-tag { font-size: 11px; color: #64748b; margin-top: 2px; }
  
  .boundary-box { background: #f8fafc; border: 2px dashed #64748b; border-radius: 10px; padding: 18px 20px; }
  .boundary-header { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #475569; margin-bottom: 14px; text-align: center; }
  .uc-sections { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .uc-cluster { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
  .cluster-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; text-align: center; }
  .uc-oval { background: #ffffff; border: 1.5px solid #94a3b8; border-radius: 20px; padding: 6px 10px; font-size: 11px; color: #334155; font-weight: 500; text-align: center; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
  .uc-oval.p-uc { border-color: #3b82f6; background: #f8faff; }
  .uc-oval.o-uc { border-color: #10b981; background: #f8fdfb; }
  .uc-oval.a-uc { border-color: #f59e0b; background: #fffdf8; }
  .arrow-label { font-size: 10px; color: #64748b; text-align: center; margin-top: 8px; }
</style>
</head>
<body>
  <div class="diagram-canvas">
    <h2>Master System Use Case Model</h2>
    <div class="subtitle">Sportzfy Platform Boundary: Player, Venue Owner, and Admin Interactions</div>
    <div class="actors-layout">
      <!-- Left Column: Player -->
      <div class="actor-col">
        <div class="actor-box player">
          <div class="actor-icon">⚽</div>
          <div class="actor-name">Player / Customer</div>
          <div class="actor-tag">Amateur Footballer</div>
        </div>
        <div class="arrow-label">Initiates Bookings &amp; Recruitment ➔</div>
      </div>

      <!-- Center Column: System Boundary with 3 Clusters -->
      <div class="boundary-box">
        <div class="boundary-header">«System Boundary» Sportzfy Web &amp; Edge Platform</div>
        <div class="uc-sections">
          <!-- Cluster 1: Player Operations -->
          <div class="uc-cluster">
            <div class="cluster-title" style="color: #2563eb;">Player Services</div>
            <div class="uc-oval p-uc">UC-1: Browse &amp; Filter Turfs</div>
            <div class="uc-oval p-uc">UC-2: 5-Min Atomic Slot Hold</div>
            <div class="uc-oval p-uc">UC-3: Checkout (bKash/Nagad)</div>
            <div class="uc-oval p-uc">UC-4: Query AI Chat Concierge</div>
            <div class="uc-oval p-uc">UC-5: Create Squad Post</div>
            <div class="uc-oval p-uc">UC-6: Join Squad with Role</div>
          </div>

          <!-- Cluster 2: Owner Management -->
          <div class="uc-cluster">
            <div class="cluster-title" style="color: #059669;">Venue Operations</div>
            <div class="uc-oval o-uc">UC-7: Manage Venue &amp; Specs</div>
            <div class="uc-oval o-uc">UC-8: Apply 168h AI Pricing</div>
            <div class="uc-oval o-uc">UC-9: Block Maintenance Slots</div>
            <div class="uc-oval o-uc">UC-10: Request Payout Disbursal</div>
          </div>

          <!-- Cluster 3: Admin Governance -->
          <div class="uc-cluster">
            <div class="cluster-title" style="color: #d97706;">Admin Governance</div>
            <div class="uc-oval a-uc">UC-11: Review Turf Registrations</div>
            <div class="uc-oval a-uc">UC-12: Settle Payout Transfers</div>
            <div class="uc-oval a-uc">UC-13: Audit Telemetry &amp; Logs</div>
          </div>
        </div>
      </div>

      <!-- Right Column: Owner & Admin -->
      <div class="actor-col">
        <div class="actor-box owner">
          <div class="actor-icon">🏟️</div>
          <div class="actor-name">Turf Owner</div>
          <div class="actor-tag">Venue Partner</div>
        </div>
        <div class="actor-box admin">
          <div class="actor-icon">🛡️</div>
          <div class="actor-name">Platform Admin</div>
          <div class="actor-tag">CUET Operator</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  await renderCard(browser, useCaseHtml, 1320, 560, path.join(OUT_DIR, 'usecase_diagram.png'));

  // =========================================================================
  // 2. Balanced Dynamic Pricing Activity Diagram (activity_pricing.png)
  // =========================================================================
  const pricingHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 24px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; }
  .diagram-canvas { width: 1260px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 28px 36px; box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
  h2 { text-align: center; color: #0f172a; margin: 0 0 4px 0; font-size: 20px; font-weight: 800; }
  .subtitle { text-align: center; color: #64748b; font-size: 13px; margin: 0 0 24px 0; }
  .swimlanes { display: grid; grid-template-columns: 280px 1fr 280px; gap: 16px; }
  .lane { border: 1.5px solid #cbd5e1; border-radius: 8px; background: #f8fafc; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .lane-owner { border-color: #86efac; background: #f0fdf4; }
  .lane-ml    { border-color: #93c5fd; background: #eff6ff; }
  .lane-db    { border-color: #cbd5e1; background: #f8fafc; }
  .lane-header { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; text-align: center; margin-bottom: 4px; padding-bottom: 6px; border-bottom: 1.5px solid rgba(0,0,0,0.08); }
  .lane-owner .lane-header { color: #166534; }
  .lane-ml .lane-header    { color: #1e40af; }
  .lane-db .lane-header    { color: #334155; }
  
  .step-node { background: #ffffff; border: 1.5px solid #94a3b8; border-radius: 6px; padding: 10px 12px; font-size: 11px; line-height: 1.4; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
  .decision-node { background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 8px; padding: 10px 12px; font-size: 11px; line-height: 1.4; color: #78350f; font-weight: 600; text-align: center; }
  .clamp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .clamp-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; font-size: 10.5px; text-align: center; }
  .connector-arrow { text-align: center; color: #64748b; font-size: 14px; margin: -4px 0; }
</style>
</head>
<body>
  <div class="diagram-canvas">
    <h2>Feature 3: ML Dynamic Pricing Activity Workflow</h2>
    <div class="subtitle">168-Hour Schedule Generation with In-Process Tree Traversal and Strict Safety Clamping</div>
    <div class="swimlanes">
      <!-- Lane 1: Owner UI -->
      <div class="lane lane-owner">
        <div class="lane-header">1. Turf Owner UI (/owner/schedule)</div>
        <div class="step-node"><b>Action:</b> Click "Apply 7-Day AI Dynamic Pricing"</div>
        <div class="connector-arrow">▼ POST /api/v1/owner/ai-pricing</div>
        <div class="step-node" style="margin-top: 80px;"><b>Render:</b> 168-hour calendar grid with green discount &amp; red surge badges</div>
        <div class="connector-arrow">▼ Reversion Option</div>
        <div class="step-node"><b>Action:</b> Click "Revert to Base Rates" to restore uniform baseline schedule</div>
      </div>

      <!-- Lane 2: In-Process Random Forest Engine -->
      <div class="lane lane-ml">
        <div class="lane-header">2. In-Process Random Forest Engine (TypeScript)</div>
        <div class="step-node"><b>Feature Extraction:</b> Convert slot UTC timestamp to BST (Asia/Dhaka). Extract is_weekend (Fri/Sat), is_prime_hour (18-23), base_price, density.</div>
        <div class="connector-arrow">▼ Traverse 100 Trees</div>
        <div class="step-node"><b>Tree Evaluation:</b> Execute sub-millisecond leaf traversal over rf_trees.json to compute raw demandScore [0.0, 1.0].</div>
        <div class="connector-arrow">▼ Apply Safety Clamps</div>
        <div class="clamp-grid">
          <div class="clamp-card" style="border-left: 3px solid #ef4444;">
            <b>Floor Clamp:</b><br>
            If rate &lt; 0.80x<br>
            <i>Clamp to 0.80x base (-20%)</i>
          </div>
          <div class="clamp-card" style="border-left: 3px solid #22c55e;">
            <b>Ceiling Clamp:</b><br>
            If rate &gt; 1.30x<br>
            <i>Clamp to 1.30x base (+30%)</i>
          </div>
        </div>
        <div class="connector-arrow">▼ Currency Rounding</div>
        <div class="step-node"><b>Final Rate Formulation:</b> Round rate to nearest 50 BDT: finalRate = round(baseRate * multiplier / 50) * 50.</div>
      </div>

      <!-- Lane 3: Neon PostgreSQL -->
      <div class="lane lane-db">
        <div class="lane-header">3. Neon PostgreSQL Persistence</div>
        <div class="step-node" style="margin-top: 110px;"><b>Atomic Transaction:</b><br>
        1. Delete existing AI AvailabilityRules for venue.<br>
        2. Bulk insert 168 new hourly AvailabilityRule records.<br>
        3. Commit under Serializable isolation.</div>
        <div class="connector-arrow">▼ Return HTTP 200</div>
        <div class="step-node"><b>Response:</b> Returns updated schedule payload with surge tier metadata.</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  await renderCard(browser, pricingHtml, 1320, 580, path.join(OUT_DIR, 'activity_pricing.png'));

  // =========================================================================
  // 3. Balanced AI Concierge Activity Diagram (activity_concierge.png)
  // =========================================================================
  const conciergeHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 24px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; }
  .diagram-canvas { width: 1260px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 28px 36px; box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
  h2 { text-align: center; color: #0f172a; margin: 0 0 4px 0; font-size: 20px; font-weight: 800; }
  .subtitle { text-align: center; color: #64748b; font-size: 13px; margin: 0 0 24px 0; }
  .swimlanes { display: grid; grid-template-columns: 280px 1fr 280px; gap: 16px; }
  .lane { border: 1.5px solid #cbd5e1; border-radius: 8px; background: #f8fafc; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .lane-client { border-color: #93c5fd; background: #eff6ff; }
  .lane-gw     { border-color: #c084fc; background: #faf5ff; }
  .lane-db     { border-color: #86efac; background: #f0fdf4; }
  .lane-header { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; text-align: center; margin-bottom: 4px; padding-bottom: 6px; border-bottom: 1.5px solid rgba(0,0,0,0.08); }
  .lane-client .lane-header { color: #1e40af; }
  .lane-gw .lane-header     { color: #6b21a8; }
  .lane-db .lane-header     { color: #166534; }
  
  .step-node { background: #ffffff; border: 1.5px solid #94a3b8; border-radius: 6px; padding: 10px 12px; font-size: 11px; line-height: 1.4; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
  .fallback-circuit { background: #ffffff; border: 1.5px solid #a855f7; border-radius: 8px; padding: 10px; font-size: 10.5px; }
  .circuit-step { display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; margin-bottom: 4px; border-radius: 4px; font-size: 10.5px; }
  .circuit-step.primary { background: #f3e8ff; color: #6b21a8; font-weight: 700; }
  .circuit-step.fallback { background: #f1f5f9; color: #334155; }
  .connector-arrow { text-align: center; color: #64748b; font-size: 14px; margin: -4px 0; }
</style>
</head>
<body>
  <div class="diagram-canvas">
    <h2>Feature 4: Dual-Engine AI Concierge Activity Flow</h2>
    <div class="subtitle">Multi-Language Banglish NLU, Fallback Circuit Breaker, and Relational Database Grounding</div>
    <div class="swimlanes">
      <!-- Lane 1: Client -->
      <div class="lane lane-client">
        <div class="lane-header">1. Client (AiChatbot.tsx)</div>
        <div class="step-node"><b>User Query:</b> "Bhai ajke raate 7v7 kono turf ache 2000 er moddhe?"</div>
        <div class="connector-arrow">▼ POST /api/v1/ai/chat</div>
        <div class="step-node" style="margin-top: 140px;"><b>Render:</b> Natural conversational reply + interactive Rich Action Cards with direct booking links</div>
      </div>

      <!-- Lane 2: Edge AI Gateway -->
      <div class="lane lane-gw">
        <div class="lane-header">2. Edge AI Gateway &amp; Fallback Circuit</div>
        <div class="step-node"><b>Request Ingestion:</b> Validate session token and extract conversation history. Start latency timer.</div>
        <div class="connector-arrow">▼ Fallback Pipeline</div>
        <div class="fallback-circuit">
          <div class="circuit-step primary">
            <span>Stage 1: Groq LPU (Qwen-3.8-27B)</span>
            <span>&lt;800ms</span>
          </div>
          <div class="circuit-step fallback">
            <span>Stage 2: Gemini 3.5 Flash (Timeout / Failover)</span>
            <span>4s Timeout</span>
          </div>
          <div class="circuit-step fallback">
            <span>Stage 3: Local Deterministic Regex NLU</span>
            <span>Offline Backup</span>
          </div>
        </div>
        <div class="connector-arrow">▼ Structured Output</div>
        <div class="step-node"><b>Intent &amp; Filter Extraction:</b> Extract intent: TURF_SEARCH, format: "7v7", maxPrice: 2000, primeHour: true.</div>
      </div>

      <!-- Lane 3: Database Grounding -->
      <div class="lane lane-db">
        <div class="lane-header">3. Neon PostgreSQL Relational Grounding</div>
        <div class="step-node" style="margin-top: 100px;"><b>Database Query:</b><br>
        SELECT * FROM "Turf" WHERE "status" = 'APPROVED' AND "pitchFormats" ILIKE '%7v7%' AND "basePricePerHour" &lt;= 2000;</div>
        <div class="connector-arrow">▼ Synthesize Rich Cards</div>
        <div class="step-node"><b>Card Generation:</b> Attach live venue specs, rating, hourly rate, and direct checkout hold button.</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  await renderCard(browser, conciergeHtml, 1320, 580, path.join(OUT_DIR, 'activity_concierge.png'));

  // =========================================================================
  // 4. Balanced CI/CD Delivery Pipeline (cicd_pipeline.png)
  // =========================================================================
  const cicdHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 24px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; }
  .diagram-canvas { width: 1260px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 28px 36px; box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
  h2 { text-align: center; color: #0f172a; margin: 0 0 4px 0; font-size: 20px; font-weight: 800; }
  .subtitle { text-align: center; color: #64748b; font-size: 13px; margin: 0 0 24px 0; }
  .pipeline-stages { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; position: relative; }
  .stage-card { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 16px; position: relative; }
  .stage-badge { font-size: 10.5px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 12px; display: inline-block; margin-bottom: 8px; }
  .stage-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
  .stage-items { font-size: 11px; color: #475569; line-height: 1.5; padding-left: 14px; margin: 0; }
  .stage-items li { margin-bottom: 4px; }
  .stage-1 { border-color: #93c5fd; } .stage-1 .stage-badge { background: #dbeafe; color: #1e40af; }
  .stage-2 { border-color: #fcd34d; } .stage-2 .stage-badge { background: #fef3c7; color: #92400e; }
  .stage-3 { border-color: #86efac; } .stage-3 .stage-badge { background: #dcfce7; color: #166534; }
  .stage-4 { border-color: #c084fc; } .stage-4 .stage-badge { background: #f3e8ff; color: #6b21a8; }
</style>
</head>
<body>
  <div class="diagram-canvas">
    <h2>Continuous Integration &amp; Continuous Deployment (CI/CD) Pipeline</h2>
    <div class="subtitle">Automated Multi-Stage Verification Pipeline from Local Feature Commit to Vercel Global Edge</div>
    <div class="pipeline-stages">
      <div class="stage-card stage-1">
        <span class="stage-badge">Stage 1</span>
        <div class="stage-title">Local Development</div>
        <ul class="stage-items">
          <li>Git feature branch (feature/*)</li>
          <li>ESLint &amp; TypeScript checks</li>
          <li>Local seed testing</li>
          <li>PR submitted to main</li>
        </ul>
      </div>

      <div class="stage-card stage-2">
        <span class="stage-badge">Stage 2</span>
        <div class="stage-title">GitHub Actions CI</div>
        <ul class="stage-items">
          <li>Trigger on push / PR to main</li>
          <li>Ubuntu 22.04 + Node.js 20.x</li>
          <li>prisma generate execution</li>
          <li>TypeScript compiler verify</li>
        </ul>
      </div>

      <div class="stage-card stage-3">
        <span class="stage-badge">Stage 3</span>
        <div class="stage-title">Automated QA Suite</div>
        <ul class="stage-items">
          <li>npm test runner execution</li>
          <li>36 Passing unit/integration tests</li>
          <li>TC-HOLD-01 Concurrency race</li>
          <li>RF Dynamic Pricing clamps</li>
        </ul>
      </div>

      <div class="stage-card stage-4">
        <span class="stage-badge">Stage 4</span>
        <div class="stage-title">Vercel Production Edge</div>
        <ul class="stage-items">
          <li>Atomic Zero-Downtime deploy</li>
          <li>Global Anycast Edge CDN</li>
          <li>SSL/TLS auto-provisioning</li>
          <li>sportzfy-zeta.vercel.app live</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`;

  await renderCard(browser, cicdHtml, 1320, 420, path.join(OUT_DIR, 'cicd_pipeline.png'));

  // =========================================================================
  // 5. Balanced Component & Design Patterns Diagram (component_diagram.png)
  // =========================================================================
  const componentHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 24px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; }
  .diagram-canvas { width: 1260px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 28px 36px; box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
  h2 { text-align: center; color: #0f172a; margin: 0 0 4px 0; font-size: 20px; font-weight: 800; }
  .subtitle { text-align: center; color: #64748b; font-size: 13px; margin: 0 0 24px 0; }
  .pattern-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .pattern-card { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 16px; border-top: 4px solid #3b82f6; }
  .p-1 { border-top-color: #3b82f6; }
  .p-2 { border-top-color: #10b981; }
  .p-3 { border-top-color: #8b5cf6; }
  .p-4 { border-top-color: #f59e0b; }
  .pattern-badge { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
  .pattern-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
  .pattern-desc { font-size: 11px; color: #475569; line-height: 1.5; margin: 0; padding-left: 14px; }
  .pattern-desc li { margin-bottom: 4px; }
</style>
</head>
<body>
  <div class="diagram-canvas">
    <h2>Software Engineering Design Patterns in Action</h2>
    <div class="subtitle">Structural and Behavioral Patterns Implemented across Sportzfy Architecture</div>
    <div class="pattern-grid">
      <div class="pattern-card p-1">
        <div class="pattern-badge">Structural Pattern</div>
        <div class="pattern-title">Repository Pattern</div>
        <ul class="pattern-desc">
          <li>Prisma Client (lib/db.ts)</li>
          <li>Decouples database queries from route handlers</li>
          <li>Centralized connection pooling with PgBouncer</li>
          <li>Enforces type-safe schema queries</li>
        </ul>
      </div>

      <div class="pattern-card p-2">
        <div class="pattern-badge">Behavioral Pattern</div>
        <div class="pattern-title">Strategy Pattern</div>
        <ul class="pattern-desc">
          <li>Dynamic Pricing Engine (lib/pricing.ts)</li>
          <li>Swaps between Static Base, Peak Surcharge, and ML RF algorithms</li>
          <li>Runtime selection based on venue availability mode</li>
          <li>Independent algorithm testability</li>
        </ul>
      </div>

      <div class="pattern-card p-3">
        <div class="pattern-badge">Resilience Pattern</div>
        <div class="pattern-title">Circuit Breaker &amp; Fallback</div>
        <ul class="pattern-desc">
          <li>AI Concierge (/api/v1/ai/chat)</li>
          <li>Primary: Groq LPU (Qwen-3.8-27B)</li>
          <li>Secondary: Google Gemini 3.5 Flash</li>
          <li>Tertiary: Local Deterministic Regex NLU</li>
        </ul>
      </div>

      <div class="pattern-card p-4">
        <div class="pattern-badge">Structural Pattern</div>
        <div class="pattern-title">Middleware / Interceptor</div>
        <ul class="pattern-desc">
          <li>Edge Auth Guard (middleware.ts)</li>
          <li>Pre-execution route protection</li>
          <li>Constant-time HMAC token validation</li>
          <li>Zero-delay unauthorized redirects</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`;

  await renderCard(browser, componentHtml, 1320, 420, path.join(OUT_DIR, 'component_diagram.png'));

  // =========================================================================
  // 6. Balanced 2D Swimlane Activity Diagram for Slot Hold (activity_diagram.png)
  // =========================================================================
  const activitySlotHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 24px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; }
  .diagram-canvas { width: 1280px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 26px 30px; box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
  h2 { text-align: center; color: #0f172a; margin: 0 0 4px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.3px; }
  .subtitle { text-align: center; color: #64748b; font-size: 13px; margin: 0 0 20px 0; }
  .swimlanes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; align-items: stretch; }
  .lane { border: 1.5px solid #cbd5e1; border-radius: 10px; background: #f8fafc; padding: 14px; display: flex; flex-direction: column; gap: 10px; position: relative; }
  .lane-player  { border-color: #93c5fd; background: #eff6ff; }
  .lane-gateway { border-color: #c084fc; background: #faf5ff; }
  .lane-lock    { border-color: #86efac; background: #f0fdf4; }
  .lane-db      { border-color: #fed7aa; background: #fffaf5; }
  .lane-header { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; text-align: center; margin-bottom: 2px; padding-bottom: 6px; border-bottom: 1.5px solid rgba(0,0,0,0.08); }
  .lane-player .lane-header  { color: #1e40af; }
  .lane-gateway .lane-header { color: #6b21a8; }
  .lane-lock .lane-header    { color: #166534; }
  .lane-db .lane-header      { color: #c2410c; }
  .step-node { background: #ffffff; border: 1.5px solid #94a3b8; border-radius: 6px; padding: 10px 12px; font-size: 11px; line-height: 1.45; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
  .decision-node { background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 8px; padding: 10px 12px; font-size: 11px; line-height: 1.4; color: #78350f; font-weight: 600; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
  .error-node { background: #fef2f2; border: 1.5px solid #ef4444; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; line-height: 1.4; color: #991b1b; }
  .success-node { background: #f0fdf4; border: 1.5px solid #22c55e; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; line-height: 1.4; color: #166534; }
  .connector-arrow { text-align: center; color: #64748b; font-size: 12px; font-weight: 600; margin: -3px 0; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
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

  await renderCard(browser, activitySlotHtml, 1340, 680, path.join(OUT_DIR, 'activity_diagram.png'));

  await browser.close();
  console.log('=== All distorted diagrams successfully restructured into balanced 2D layouts! ===');
}

main().catch(err => {
  console.error('Error rendering balanced diagrams:', err);
  process.exit(1);
});
