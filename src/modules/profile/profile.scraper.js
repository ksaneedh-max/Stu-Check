exports.extractProfile = async (page) => {

  let profileFrame = null;

  /* ---------- FAST PATH ---------- */

  try {

    const table = await page.waitForSelector("table", { timeout: 5000 });

    if (table) {
      profileFrame = page;
    }

  } catch {}



  /* ---------- FRAME SEARCH ---------- */

  if (!profileFrame) {

    for (const frame of page.frames()) {

      try {

        const table = await frame.waitForSelector(
          "table",
          { timeout: 4000 }
        );

        if (table) {
          profileFrame = frame;
          break;
        }

      } catch {}

    }

  }



  /* ---------- SLOW NETWORK FALLBACK ---------- */

  if (!profileFrame) {

    await page.waitForTimeout(3000);

    for (const frame of page.frames()) {

      try {

        const table = await frame.$("table");

        if (table) {
          profileFrame = frame;
          break;
        }

      } catch {}

    }

  }



  if (!profileFrame) {
    return {};
  }



  /* ---------- WAIT FOR ROWS ---------- */

  try {

    await profileFrame.waitForFunction(() => {

      const rows = document.querySelectorAll("table tbody tr");
      return rows.length > 2;

    }, { timeout: 15000 });

  } catch {

    return {};

  }



  /* ---------- WAIT FOR VALUES ---------- */

  try {

    await profileFrame.waitForFunction(() => {

      const cells = document.querySelectorAll("table tbody td");

      return Array.from(cells).some(td =>
        td.innerText.trim() !== ""
      );

    }, { timeout: 10000 });

  } catch {}



  /* ---------- STABILIZATION DELAY ---------- */

  await page.waitForTimeout(300);



  /* ---------- SCRAPE PROFILE ---------- */

  const profile = await profileFrame.evaluate(() => {

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



  /* ---------- VALIDATION FALLBACK ---------- */

  if (!profile.name) {

    await page.waitForTimeout(1000);

    const retry = await profileFrame.evaluate(() => {

      const rows = document.querySelectorAll("table tbody tr");

      const profile = {};

      rows.forEach(row => {

        const cols = row.querySelectorAll("td");

        for (let i = 0; i < cols.length; i += 2) {

          const label = cols[i]?.innerText.trim();
          const value = cols[i + 1]?.innerText.trim();

          if (!label || !value) continue;

          if (label.includes("Name"))
            profile.name = value;

          if (label.includes("Registration Number"))
            profile.regNo = value;

        }

      });

      return profile;

    });

    return retry;

  }



  return profile;

};
