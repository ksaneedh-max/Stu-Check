const {
  ensureBrowser,
  createSession,
  getPage,
  saveSession,
  touchSession
} = require("../../browser/browserManager");

const { PORTAL_URL } = require("../../config/env");


/* ---------- FIND FIELD ---------- */

async function findField(page, selectors) {

  for (const sel of selectors) {

    const el = page.locator(sel);

    if (await el.count()) {
      return el.first();
    }

  }

  for (const frame of page.frames()) {

    for (const sel of selectors) {

      const el = frame.locator(sel);

      if (await el.count()) {
        return el.first();
      }

    }

  }

  return null;

}


/* ---------- LOGIN CHECK ---------- */

async function isLoggedIn(sessionId) {

  await ensureBrowser();

  let page = getPage(sessionId);

  if (!page) {

    const session = await createSession(sessionId);
    page = session.page;

  }

  try {

    let current = page.url();

    if (!current || current === "about:blank") {

      await page.goto(PORTAL_URL, {
        waitUntil: "domcontentloaded"
      });

      await page.waitForTimeout(1500);

      current = page.url();

    }

    const loggedRoutes = [
      "#WELCOME",
      "My_Attendance",
      "#My_Attendance",
      "#Marks",
      "#Dashboard"
    ];

    const logged = loggedRoutes.some(r => current.includes(r));

    if (logged) {
      touchSession(sessionId);
    }

    return logged;

  } catch (err) {

    console.log("Login check failed:", err.message);

    return false;

  }

}


/* ---------- SESSION LIMIT HANDLER ---------- */

async function handleSessionLimit(page) {

  try {

    await page.waitForTimeout(3000);

    const terminateScreen = page.locator("#continue_button");

    if (await terminateScreen.count()) {

      console.log("Session limit detected → terminating old sessions");

      await terminateScreen.first().click();

      await page.waitForTimeout(2000);

      const confirmPopup = page.locator(".confirm-delete_btn");

      if (await confirmPopup.count()) {

        await confirmPopup.first().click();

        await page.waitForTimeout(2000);

      }

    }

  } catch (err) {

    console.log("Session limit handler error:", err.message);

  }

}


/* ---------- LOGIN ---------- */

async function login(sessionId, { email, password }) {

  await ensureBrowser();

  if (!email || !password) {
    throw new Error("email and password required");
  }

  /* ---------- CREATE / RESTORE SESSION ---------- */

  const session = await createSession(sessionId);
  const page = session.page;

  touchSession(sessionId);

  const logged = await isLoggedIn(sessionId);

  if (logged) {
    return { status: "already_logged_in" };
  }

  /* ---------- OPEN PORTAL ---------- */

  await page.goto(PORTAL_URL, {
    waitUntil: "domcontentloaded"
  });

  await page.waitForTimeout(3000);


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


  /* ---------- NEXT BUTTON ---------- */

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


  /* ---------- WAIT PASSWORD PAGE ---------- */

  await page.waitForTimeout(2000);


  /* ---------- PASSWORD FIELD ---------- */

  const passwordField = await findField(page, [
    "#password",
    'input[name="PASSWORD"]',
    'input[type="password"]'
  ]);

  if (!passwordField) {
    throw new Error("Password field not found");
  }

  await passwordField.fill(password);

  await nextBtn.click();


  /* ---------- HANDLE SESSION LIMIT ---------- */

  await page.waitForTimeout(2000);

  await handleSessionLimit(page);


  /* ---------- WAIT DASHBOARD ---------- */

  try {

    await page.waitForLoadState("networkidle");

  } catch (err) {

    console.log("Network idle wait skipped:", err.message);

  }


  /* ---------- SAVE SESSION ---------- */

  await saveSession(sessionId);

  touchSession(sessionId);


  return {
    status: "login_success"
  };

}


module.exports = {
  login,
  isLoggedIn
};
