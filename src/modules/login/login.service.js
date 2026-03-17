const {
  ensureBrowser,
  createSession,
  getPage,
  saveSession,
  touchSession
} = require("../../browser/browserManager");

const { PORTAL_URL } = require("../../config/env");

const {
  detectLoginPage,
  performLogin
} = require("./login.scraper");


/* ---------- EMAIL NORMALIZER ---------- */

function normalizeEmail(email) {

  if (!email) return null;

  email = email.trim().toLowerCase();

  /* if user entered only username */
  if (!email.includes("@")) {
    email = email + "@srmist.edu.in";
  }

  /* if wrong domain */
  if (!email.endsWith("@srmist.edu.in")) {
    email = email.split("@")[0] + "@srmist.edu.in";
  }

  return email;

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

    await page.goto(PORTAL_URL, {
      waitUntil: "domcontentloaded"
    });

    await page.waitForTimeout(1500);

    const loginPage = await detectLoginPage(page);

    if (loginPage) {
      return false;
    }

    touchSession(sessionId);

    return true;

  } catch (err) {

    console.log("Login check failed:", err.message);

    return false;

  }

}


/* ---------- LOGIN SERVICE ---------- */

async function login(sessionId, { email, password }) {

  await ensureBrowser();

  if (!email || !password) {

    return {
      error: "INVALID_INPUT",
      message: "Email and password are required"
    };

  }

  /* normalize email */
  email = normalizeEmail(email);

  const session = await createSession(sessionId);
  const page = session.page;

  touchSession(sessionId);

  const logged = await isLoggedIn(sessionId);

  if (logged) {

    return {
      status: "already_logged_in"
    };

  }

  /* perform login */

  const result = await performLogin(page, { email, password });

  /* if scraper returned error */

  if (result?.error) {
    return result;
  }

  /* ensure login success */

  if (!result?.success) {

    return {
      error: "LOGIN_FAILED",
      message: "Invalid email or password"
    };

  }

  /* login success */

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