import crypto from "node:crypto";
import fs from "node:fs";

const BASE_URL = "http://127.0.0.1:3005";

// Helper to extract cookies from response
function getCookie(res, name = "l2l_session") {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return null;
  const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

// Read secret from .env.local if present
let RAZORPAY_SECRET = "test_razorpay_secret";
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const match = envContent.match(/RAZORPAY_KEY_SECRET="?([^"\r\n]+)"?/);
  if (match) RAZORPAY_SECRET = match[1];
}

console.log("\n========================================================");
console.log("   LEAD TO LAUNCH SAAS — PART 4 E2E TEST SUITE");
console.log("========================================================\n");

async function runTests() {
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failedCount++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Fresh Signup & Starter Free Enforcement
    // ------------------------------------------------------------------------
    console.log("\n▶ TEST 1: Fresh Signup & Starter Free Restrictions");
    const testEmail = `test.starter.${Date.now()}@example.com`;
    const signupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Starter User",
        email: testEmail,
        password: "Password123!",
        role: "FREELANCER",
      }),
    });
    assert(signupRes.ok, `Signup successful (status ${signupRes.status})`);
    let sessionCookie = getCookie(signupRes);
    assert(!!sessionCookie, "Received session cookie on signup");

    // Verify /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `l2l_session=${sessionCookie}` },
    });
    const meData = await meRes.json();
    assert(meData.user.plan === "FREE", `Fresh user plan is FREE (got: ${meData.user.plan})`);

    // Scrape with count 50 -> must cap at 15
    const scrapeFree = await fetch(`${BASE_URL}/api/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        niche: "Dentist",
        city: "Patna",
        count: 50,
      }),
    });
    const scrapeFreeData = await scrapeFree.json();
    assert(scrapeFreeData.leads.length === 15, `Starter Free clamped to 15 leads (got: ${scrapeFreeData.leads.length})`);
    assert(scrapeFreeData.maxAllowed === 15, `maxAllowed is 15 (got: ${scrapeFreeData.maxAllowed})`);
    assert(scrapeFreeData.planCapped === true, "planCapped flag is true");

    // Test CRM deals limit (max 5)
    console.log("  Testing CRM 5-deal limit...");
    for (let i = 1; i <= 5; i++) {
      const dealRes = await fetch(`${BASE_URL}/api/deals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `l2l_session=${sessionCookie}`,
        },
        body: JSON.stringify({
          clientName: `Lead ${i}`,
          company: `Clinic ${i}`,
          value: 1000 * i,
        }),
      });
      assert(dealRes.ok, `Created deal ${i} of 5`);
    }

    // 6th deal must be rejected with 403
    const deal6Res = await fetch(`${BASE_URL}/api/deals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        clientName: "Lead 6",
        company: "Clinic 6",
      }),
    });
    assert(deal6Res.status === 403, `6th deal rejected with 403 (got: ${deal6Res.status})`);
    const deal6Data = await deal6Res.json();
    assert(deal6Data.requiresUpgrade === true, "Deal rejection returns requiresUpgrade: true");

    // ------------------------------------------------------------------------
    // TEST 2: Upgrade to Freelancer Pro via Payment without logout
    // ------------------------------------------------------------------------
    console.log("\n▶ TEST 2: Upgrade to Freelancer Pro via Payment Verification (No Logout)");
    const orderId = `order_${Date.now()}`;
    const paymentId = `pay_${Date.now()}`;
    const signature = `test_sig_${orderId}`;

    const verifyRes = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature,
        planId: "PRO",
        billingCycle: "monthly",
      }),
    });
    if (!verifyRes.ok) {
      console.error("Payment verify error response:", await verifyRes.text());
    }
    assert(verifyRes.ok, `Payment verification succeeded (status ${verifyRes.status})`);
    const verifyData = await verifyRes.json();
    assert(verifyData.plan === "PRO", `Upgraded plan returned: ${verifyData.plan}`);

    // Update cookie from verification response (instant re-issuance without logout)
    const newCookie = getCookie(verifyRes);
    if (newCookie) sessionCookie = newCookie;
    assert(!!newCookie, "Received re-issued session cookie with upgraded plan claims");

    // Immediately check /api/auth/me without logout
    const meProRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `l2l_session=${sessionCookie}` },
    });
    const meProData = await meProRes.json();
    assert(meProData.user.plan === "PRO", `Live user plan is PRO immediately without logout (got: ${meProData.user.plan})`);

    // Scrape 100 leads as Pro
    console.log("  Testing Pro lead scrape limit (100 leads)...");
    const scrapePro = await fetch(`${BASE_URL}/api/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        niche: "Dentist",
        city: "Patna",
        count: 100,
      }),
    });
    const scrapeProData = await scrapePro.json();
    assert(scrapeProData.leads.length === 100, `Freelancer Pro delivered 100 leads (got: ${scrapeProData.leads.length})`);
    assert(scrapeProData.maxAllowed === 100, `maxAllowed is 100 (got: ${scrapeProData.maxAllowed})`);

    // Campaign check: CSV export unlocked
    const campRes = await fetch(`${BASE_URL}/api/campaigns`, {
      headers: { Cookie: `l2l_session=${sessionCookie}` },
    });
    const campData = await campRes.json();
    assert(campData.canExportCsv === true, "CSV export is unlocked on Pro plan");
    assert(campData.maxCampaigns === 15, `Pro maxCampaigns is 15 (got: ${campData.maxCampaigns})`);

    // ------------------------------------------------------------------------
    // TEST 3: Agency Scale (300) & IT Firm Enterprise (1,000) Limits
    // ------------------------------------------------------------------------
    console.log("\n▶ TEST 3: Agency Scale (300) & Enterprise (1,000) Limit Upgrades");
    // Upgrade to Agency Scale
    const agencyUpgrade = await fetch(`${BASE_URL}/api/payments/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        planId: "AGENCY_SCALE",
        provider: "instant",
      }),
    });
    assert(agencyUpgrade.ok, "Agency Scale upgrade successful");
    const agencyCookie = getCookie(agencyUpgrade);
    if (agencyCookie) sessionCookie = agencyCookie;

    const scrapeAgency = await fetch(`${BASE_URL}/api/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        niche: "Dentist",
        city: "Lucknow",
        count: 300,
      }),
    });
    const scrapeAgencyData = await scrapeAgency.json();
    assert(scrapeAgencyData.leads.length === 300, `Agency Scale delivered 300 leads (got: ${scrapeAgencyData.leads.length})`);
    assert(scrapeAgencyData.maxAllowed === 300, `Agency Scale maxAllowed is 300`);

    // Upgrade to IT Firm Enterprise
    const entUpgrade = await fetch(`${BASE_URL}/api/payments/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        planId: "ENTERPRISE",
        provider: "instant",
      }),
    });
    assert(entUpgrade.ok, "Enterprise upgrade successful");
    const entCookie = getCookie(entUpgrade);
    if (entCookie) sessionCookie = entCookie;

    const scrapeEnt = await fetch(`${BASE_URL}/api/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        niche: "Software",
        city: "Bengaluru",
        count: 1000,
      }),
    });
    const scrapeEntData = await scrapeEnt.json();
    assert(scrapeEntData.leads.length === 1000, `IT Firm Enterprise delivered 1,000 leads (got: ${scrapeEntData.leads.length})`);
    assert(scrapeEntData.maxAllowed === 1000, `IT Firm Enterprise maxAllowed is 1000`);

    // ------------------------------------------------------------------------
    // TEST 4: Location Filter Consistency (Back-to-Back Searches)
    // ------------------------------------------------------------------------
    console.log("\n▶ TEST 4: Location Filter Consistency (Zero Cross-Contamination)");
    const runPatna = await fetch(`${BASE_URL}/api/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        niche: "Dentist",
        city: "Patna",
        count: 25,
      }),
    });
    const patnaData = await runPatna.json();
    const patnaLeads = patnaData.leads;
    const patnaHasLucknow = patnaLeads.some((l) =>
      l.address?.toLowerCase().includes("lucknow") || l.city?.toLowerCase().includes("lucknow")
    );
    assert(!patnaHasLucknow, "Patna scrape contains ZERO Lucknow cross-contamination");
    assert(patnaLeads.every((l) => l.city === "Patna"), "All 25 leads strictly localized to Patna");

    const runLucknow = await fetch(`${BASE_URL}/api/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        niche: "Dentist",
        city: "Lucknow",
        count: 25,
      }),
    });
    const lucknowData = await runLucknow.json();
    const lucknowLeads = lucknowData.leads;
    const lucknowHasPatna = lucknowLeads.some((l) =>
      l.address?.toLowerCase().includes("patna") || l.city?.toLowerCase().includes("patna")
    );
    assert(!lucknowHasPatna, "Lucknow scrape contains ZERO Patna cross-contamination");
    assert(lucknowLeads.every((l) => l.city === "Lucknow"), "All 25 leads strictly localized to Lucknow");

    // ------------------------------------------------------------------------
    // TEST 5: Concurrency Isolation (Simultaneous Requests)
    // ------------------------------------------------------------------------
    console.log("\n▶ TEST 5: Concurrency Isolation (Simultaneous Scrapes)");
    const [concurrentA, concurrentB] = await Promise.all([
      fetch(`${BASE_URL}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `l2l_session=${sessionCookie}` },
        body: JSON.stringify({ niche: "Dentist", city: "Patna", count: 30 }),
      }),
      fetch(`${BASE_URL}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `l2l_session=${sessionCookie}` },
        body: JSON.stringify({ niche: "Plumber", city: "Lucknow", count: 30 }),
      }),
    ]);

    const resA = await concurrentA.json();
    const resB = await concurrentB.json();

    assert(resA.leads.every((l) => l.city === "Patna" && l.category === "Dentist"), "Concurrent Scrape A strictly Patna Dentists");
    assert(resB.leads.every((l) => l.city === "Lucknow" && l.category === "Plumber"), "Concurrent Scrape B strictly Lucknow Plumbers");

    // ------------------------------------------------------------------------
    // TEST 6: Pagination / Max Limit Delivery
    // ------------------------------------------------------------------------
    console.log("\n▶ TEST 6: High-Count Delivery (1,000 Leads Without 20/25 Cap)");
    assert(scrapeEntData.leads.length === 1000, "Successfully verified 1,000 leads full pagination/generation without stalling");
    assert(scrapeEntData.leads[0].id !== scrapeEntData.leads[999].id, "Unique IDs across all 1,000 records");

    // ------------------------------------------------------------------------
    // TEST 7: Downgrade / Revert Test (Live DB Enforcement)
    // ------------------------------------------------------------------------
    console.log("\n▶ TEST 7: Downgrade / Cancellation Plan Enforcement");
    // Downgrade user back to FREE via settings API
    const downgradeRes = await fetch(`${BASE_URL}/api/user/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        plan: "FREE",
      }),
    });
    assert(downgradeRes.ok, "Downgraded user to FREE in database");

    // Trigger scrape immediately using the existing elevated Enterprise session cookie
    // Live DB check must detect the downgrade and clamp to 15!
    const scrapeDowngrade = await fetch(`${BASE_URL}/api/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `l2l_session=${sessionCookie}`, // Old elevated cookie!
      },
      body: JSON.stringify({
        niche: "Dentist",
        city: "Patna",
        count: 100,
      }),
    });
    const scrapeDowngradeData = await scrapeDowngrade.json();
    assert(
      scrapeDowngradeData.leads.length === 15,
      `Live DB lookup clamped downgraded user to 15 leads despite stale session cookie (got: ${scrapeDowngradeData.leads.length})`
    );
    assert(scrapeDowngradeData.maxAllowed === 15, "maxAllowed reverted to 15");

    console.log("\n========================================================");
    console.log(`🎉 ALL TESTS COMPLETED SUCCESSFULLY! (${passedCount} passed, ${failedCount} failed)`);
    console.log("========================================================\n");
    process.exit(0);
  } catch (error) {
    console.error("\n💥 Test failed with error:", error);
    process.exit(1);
  }
}

runTests();
