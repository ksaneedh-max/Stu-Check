const { ensureBrowser, getPage } = require("../../browser/browserManager");
const scraper = require("./profile.scraper");

async function getProfile(sessionId) {

  await ensureBrowser();

  const page = getPage(sessionId);

  if (!page) {
    throw new Error("User not logged in");
  }

  /* ---------- OPEN PROFILE PAGE ---------- */

  await page.evaluate(() => {
    window.location.hash = "Page:My_Time_Table_2023_24";
  });

  /* ---------- WAIT FOR PROFILE TABLE ---------- */

  await page.waitForSelector("table", { timeout: 15000 });

  /* ---------- ENSURE ROWS EXIST ---------- */

  await page.waitForFunction(() => {
    const rows = document.querySelectorAll("table tbody tr");
    return rows.length > 2;
  });

  /* ---------- ENSURE VALUES ARE FILLED ---------- */

  await page.waitForFunction(() => {
    const cells = document.querySelectorAll("table tbody td");
    return Array.from(cells).some(td => td.innerText.trim() !== "");
  });

  /* ---------- STABILIZATION DELAY ---------- */

  await page.waitForTimeout(300);

  /* ---------- SCRAPE PROFILE ---------- */

  return scraper.extractProfile(page);

}

module.exports = { getProfile };