const { ensureBrowser, getPage } = require("../../browser/browserManager");
const scraper = require("./marks.scraper");

async function getMarks() {
  await ensureBrowser();

  const page = getPage();

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  await page.waitForTimeout(2000);

  return scraper.extract(page);
}

module.exports = { getMarks };