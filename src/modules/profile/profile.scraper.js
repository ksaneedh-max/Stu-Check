exports.extractProfile = async (page) => {

  /* ---------- WAIT FOR PROFILE TABLE ---------- */

  try {
    await page.waitForSelector("table", { timeout: 15000 });
  } catch {
    return {};
  }

  /* ---------- WAIT FOR ROWS ---------- */

  await page.waitForFunction(() => {
    const rows = document.querySelectorAll("table tbody tr");
    return rows.length > 2;
  });

  /* ---------- WAIT FOR VALUES TO POPULATE ---------- */

  await page.waitForFunction(() => {
    const cells = document.querySelectorAll("table tbody td");
    return Array.from(cells).some(td => td.innerText.trim() !== "");
  });

  /* ---------- STABILIZATION DELAY ---------- */

  await page.waitForTimeout(300);

  /* ---------- SCRAPE PROFILE ---------- */

  return page.evaluate(() => {

    const profile = {};

    const rows = document.querySelectorAll("table tbody tr");

    rows.forEach(row => {

      const cols = row.querySelectorAll("td");

      for (let i = 0; i < cols.length; i += 2) {

        const label = cols[i]?.innerText.trim();
        const value = cols[i + 1]?.innerText.trim();

        if (!label || !value) continue;

        if (label.includes("Registration Number"))
          profile.regNo = value;

        if (label.includes("Name"))
          profile.name = value;

        if (label.includes("Batch"))
          profile.batch = value;

        if (label.includes("Mobile"))
          profile.mobile = value;

        if (label.includes("Program"))
          profile.program = value;

        if (label.includes("Department"))
          profile.department = value;

        if (label.includes("Semester"))
          profile.semester = value;

      }

    });

    return profile;

  });

};