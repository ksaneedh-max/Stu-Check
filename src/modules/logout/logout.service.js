const { getPage, destroySession } = require("../../browser/browserManager");

async function logoutService(sessionId) {

  const page = getPage(sessionId);

  if (!page) {
    return { status: "not_logged_in" };
  }

  try {

    console.log("Logging out from SRM...");

    /* ---------- OPEN PROFILE MENU ---------- */

    const profileMenu = page.locator("#zc-account-settings");

    if (await profileMenu.count()) {
      await profileMenu.first().click();
      await page.waitForTimeout(1000);
    }

    /* ---------- CLICK LOGOUT ---------- */

    const logoutBtn = page.locator("#portalLogout");

    if (await logoutBtn.count()) {

      await logoutBtn.first().click();

      console.log("SRM logout clicked");

      /* wait briefly for logout redirect */

      try {
        await page.waitForNavigation({
          timeout: 5000
        });
      } catch {
        // navigation might not happen, that's okay
      }

    }

    /* ---------- DESTROY SESSION ---------- */

    await destroySession(sessionId);

    console.log("Session destroyed:", sessionId);

    return {
      status: "logged_out"
    };

  } catch (err) {

    console.log("LOGOUT ERROR:", err);

    return {
      error: "Logout failed"
    };

  }

}

module.exports = logoutService;
