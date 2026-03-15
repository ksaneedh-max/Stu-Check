const { ensureBrowser, getPage } = require("../../browser/browserManager");
const scraper = require("./attendance.scraper");

async function getAttendance() {
  await ensureBrowser();

  const page = getPage();

  await page.evaluate(() => {
    window.location.hash = "Page:My_Attendance";
  });

  await page.waitForTimeout(4000);

  return scraper.extract(page);
}

module.exports = { getAttendance };