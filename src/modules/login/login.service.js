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
    throw new Error("email and password required");
  }

  const session = await createSession(sessionId);
  const page = session.page;

  touchSession(sessionId);

  const logged = await isLoggedIn(sessionId);

  if (logged) {
    return { status: "already_logged_in" };
  }

  await performLogin(page, { email, password });

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
