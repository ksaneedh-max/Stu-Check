exports.extract = async (page) => {

  let attendanceFrame = null;

  /* ---------- TRY MULTIPLE TIMES UNTIL TABLE LOADS ---------- */

  for (let attempt = 0; attempt < 10; attempt++) {

    for (const frame of page.frames()) {

      try {

        const rows = await frame.locator("table tbody tr").count();

        if (rows > 1) {
          attendanceFrame = frame;
          break;
        }

      } catch {}

    }

    if (attendanceFrame) break;

    /* wait a bit before retry */
    await page.waitForTimeout(300);
  }

  if (!attendanceFrame) {
    return { courses: [] };
  }

  /* ---------- SCRAPE DATA ---------- */

  return attendanceFrame.evaluate(() => {

    const rows = document.querySelectorAll("table tbody tr");

    const data = [];

    rows.forEach((row, index) => {

      if (index === 0) return; // skip header

      const cols = row.querySelectorAll("td");

      if (!cols || cols.length < 9) return;

      const code = cols[0].innerText.trim();
      const title = cols[1].innerText.trim();
      const faculty = cols[3].innerText.trim();
      const slot = cols[4].innerText.trim();
      const room = cols[5].innerText.trim();

      const conductedText = cols[6].innerText.trim();
      const absentText = cols[7].innerText.trim();
      const attendanceText = cols[8].innerText.trim();

      const conducted = parseInt(conductedText);
      const absent = parseInt(absentText);

      if (isNaN(conducted) || code === "" || title === "") return;

      data.push({
        code,
        title,
        faculty,
        slot,
        room,
        conducted,
        absent,
        attendance: attendanceText
      });

    });

    return { courses: data };

  });

};
