const { ensureBrowser, getPage, getContext, STORAGE_FILE } =
  require("../../browser/browserManager");

const { PORTAL_URL } = require("../../config/env");
const fs = require("fs");


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

  throw new Error("Field not found");

}


/* ---------- LOGIN CHECK ---------- */

async function isLoggedIn() {

  const page = getPage();

  try {

    await page.goto(PORTAL_URL, {
      waitUntil: "domcontentloaded"
    });

    await page.waitForTimeout(2000);

    const dashboard = await page.locator("text=My Attendance").count();

    return dashboard > 0;

  } catch {

    return false;

  }

}


/* ---------- SESSION LIMIT HANDLER ---------- */

async function handleSessionLimit(page) {

  try {

    console.log("Checking for session limit screen...");

    // allow session limit screen to appear
    await page.waitForTimeout(3000);

    const terminateScreen = page.locator("#continue_button");

    if (await terminateScreen.count()) {

      console.log("Session limit screen detected → clicking terminate");

      await terminateScreen.first().click();

      await page.waitForTimeout(2000);

      const confirmPopup = page.locator(".confirm-delete_btn");

      if (await confirmPopup.count()) {

        console.log("Confirmation popup detected → terminating sessions");

        await confirmPopup.first().click();

        await page.waitForTimeout(2000);

      } else {

        console.log("No confirmation popup → session terminated");

      }

    } else {

      console.log("No session limit screen detected");

    }

  } catch (err) {

    console.log("Session limit handler error:", err.message);

  }

}


/* ---------- LOGIN ---------- */

async function login({ email, password }) {

  await ensureBrowser();

  const page = getPage();
  const context = getContext();

  if (!email || !password) {
    throw new Error("email and password required");
  }

  const logged = await isLoggedIn();

  if (logged) {
    return { status: "already_logged_in" };
  }

  await page.goto(PORTAL_URL, {
    waitUntil: "networkidle"
  });


  const emailField = await findField(page, [

    "#login_id",
    'input[name="LOGIN_ID"]',
    'input[placeholder="Email Address"]',
    'input[type="text"]'

  ]);

  await emailField.fill(email);


  const nextBtn = await findField(page, [

    "#nextbtn",
    'button[type="submit"]',
    'button:has-text("Next")',
    'button:has-text("Sign in")',
    'input[type="submit"]'

  ]);

  await nextBtn.click();


  const passwordField = await findField(page, [

    "#password",
    'input[name="PASSWORD"]',
    'input[type="password"]'

  ]);

  await passwordField.fill(password);

  await nextBtn.click();


  /* ---------- HANDLE SESSION LIMIT ---------- */

  await page.waitForTimeout(2000);

  await handleSessionLimit(page);


  /* ---------- WAIT FOR DASHBOARD ---------- */

  await page.waitForLoadState("networkidle");


  /* ---------- SAVE SESSION ---------- */

  try {

    await context.storageState({ path: STORAGE_FILE });

  } catch {}


  return {
    status: "login_success"
  };

}


module.exports = {
  login,
  isLoggedIn
};