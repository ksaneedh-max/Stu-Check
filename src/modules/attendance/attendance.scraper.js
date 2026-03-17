exports.extract = async (page) => {

  try {

    let attendanceFrame = null;

    /* ---------- FIND FRAME ---------- */

    for (const frame of page.frames()) {

      try {

        const table = await frame.waitForSelector(
          "table tbody tr",
          { timeout: 5000 }
        );

        if (table) {
          attendanceFrame = frame;
          break;
        }

      } catch {}

    }

    if (!attendanceFrame) {
      throw new Error("Attendance table not found");
    }

    /* ---------- SCRAPE ---------- */

    const courses = await attendanceFrame.$$eval(
      "table tbody tr",
      (rows) => {

        const data = [];

        rows.forEach((row, index) => {

          if (index === 0) return;

          const cols = row.querySelectorAll("td");
          if (cols.length < 9) return;

          const code = cols[0].innerText.trim();
          const title = cols[1].innerText.trim();
          const faculty = cols[3].innerText.trim();
          const slot = cols[4].innerText.trim();
          const room = cols[5].innerText.trim();

          const conducted = parseInt(cols[6].innerText.trim());
          const absent = parseInt(cols[7].innerText.trim());
          const attendance = cols[8].innerText.trim();

          if (!code || !title || isNaN(conducted)) return;

          data.push({
            code,
            title,
            faculty,
            slot,
            room,
            conducted,
            absent,
            attendance
          });

        });

        return data;

      }
    );

    return { courses };

  } catch (err) {

    console.error("Attendance scrape error:", err.message);

    return { courses: [] };

  }

};