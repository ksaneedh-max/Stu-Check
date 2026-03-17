const { PORTAL_URL } = require("../../config/env");

/* ---------- FIND FIELD ---------- */

async function findField(page, selectors) {

  /* fast path */
  for (const sel of selectors) {

    try {

      const el = page.locator(sel);

      if (await el.count()) {
        return el.first();
      }

    } catch {}

  }

  /* frame search */
  for (const frame of page.frames()) {

    for (const sel of selectors) {

      try {

        const el = frame.locator(sel);

        if (await el.count()) {
          return el.first();
        }

      } catch {}

    }

  }

  return null;

}


/* ---------- SESSION LIMIT HANDLER ---------- */

async function handleSessionLimit(page) {

  try {

    const terminateScreen = page.locator("#continue_button");

    if (await terminateScreen.count()) {

      console.log("Session limit detected → terminating old sessions");

      await terminateScreen.first().click();

      await page.waitForTimeout(1500);

      const confirmPopup = page.locator(".confirm-delete_btn");

      if (await confirmPopup.count()) {
        await confirmPopup.first().click();
      }

    }

  } catch (err) {

    console.log("Session limit handler error:", err.message);

  }

}


/* ---------- CHECK LOGIN PAGE ---------- */

async function detectLoginPage(page) {

  const loginField = await findField(page, [
    "#login_id",
    'input[name="LOGIN_ID"]',
    'input[placeholder="Email Address"]'
  ]);

  return !!loginField;

}


/* ---------- LOGIN SCRAPER ---------- */

async function performLogin(page, { email, password }) {

  await page.goto(PORTAL_URL, {
    waitUntil: "domcontentloaded"
  });

  /* small settle delay */
  await page.waitForTimeout(1500);

  /* ---------- EMAIL FIELD ---------- */

  const emailField = await findField(page, [
    "#login_id",
    'input[name="LOGIN_ID"]',
    'input[placeholder="Email Address"]',
    'input[type="text"]'
  ]);

  if (!emailField) {
    throw new Error("Login email field not found");
  }

  await emailField.fill(email);

  const nextBtn = await findField(page, [
    "#nextbtn",
    'button[type="submit"]',
    'button:has-text("Next")',
    'button:has-text("Sign in")',
    'input[type="submit"]'
  ]);

  if (!nextBtn) {
    throw new Error("Next button not found");
  }

  await nextBtn.click();

  /* ---------- PASSWORD FIELD ---------- */

  let passwordField = null;

  for (let i = 0; i < 6; i++) {

    passwordField = await findField(page, [
      "#password",
      'input[name="PASSWORD"]',
      'input[type="password"]'
    ]);

    if (passwordField) break;

    await page.waitForTimeout(500);

  }

  if (!passwordField) {

    return {
      error: "EMAIL_ERROR",
      message: "Invalid email address"
    };

  }

  await passwordField.fill(password);

  await nextBtn.click();

  /* ---------- SESSION LIMIT ---------- */

  await handleSessionLimit(page);

  /* ---------- WAIT FOR RESULT ---------- */

  try {

    await page.waitForFunction(() => {
      return location.href.includes("#WELCOME") ||
             document.querySelector("#login_id") !== null;
    }, { timeout: 10000 });

  } catch {}

  /* ---------- LOGIN RESULT CHECK ---------- */

  const url = page.url();

  if (url.includes("#WELCOME")) {

    return { success: true };

  }

  return {
    error: "LOGIN_FAILED",
    message: "Invalid email or password"
  };

}

module.exports = {
  detectLoginPage,
  performLogin
};
