const { ensureBrowser, getPage } = require("../../browser/browserManager");
const scraper = require("./attendance.scraper");
const PQueue = require("p-queue").default;

const queue = new PQueue({ concurrency: 5 });

async function getAttendance(sessionId) {

  await ensureBrowser();

  const page = getPage(sessionId);

  if (!page) {
    throw new Error("User not logged in");
  }

  return queue.add(async () => {

    /* ---------- NAVIGATE ---------- */

    await page.evaluate(() => {
      location.hash = "Page:My_Attendance";
    });

    /* wait for iframe refresh */
    await page.waitForTimeout(1500);

    return scraper.extract(page);

  });

}

module.exports = { getAttendance };