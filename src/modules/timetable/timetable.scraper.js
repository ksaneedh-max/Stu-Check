exports.extractTimetable = async (page, slotMap) => {

  let timetableFrame = null;

  /* ---------- FAST PATH ---------- */

  try {

    const table = await page.waitForSelector(
      "table[border='5']",
      { timeout: 5000 }
    );

    if (table) {
      timetableFrame = page;
    }

  } catch {}



  /* ---------- FRAME SEARCH ---------- */

  if (!timetableFrame) {

    for (const frame of page.frames()) {

      try {

        const table = await frame.waitForSelector(
          "table[border='5']",
          { timeout: 4000 }
        );

        if (table) {
          timetableFrame = frame;
          break;
        }

      } catch {}

    }

  }



  /* ---------- SLOW NETWORK FALLBACK ---------- */

  if (!timetableFrame) {

    await page.waitForTimeout(3000);

    for (const frame of page.frames()) {

      try {

        const table = await frame.$("table[border='5']");

        if (table) {
          timetableFrame = frame;
          break;
        }

      } catch {}

    }

  }



  if (!timetableFrame) {
    return { periods: [], dayOrders: {} };
  }



  /* ---------- WAIT FOR ROWS ---------- */

  try {

    await timetableFrame.waitForFunction(() => {

      const table = document.querySelector("table[border='5']");
      if (!table) return false;

      return table.querySelectorAll("tr").length > 3;

    }, { timeout: 15000 });

  } catch {

    return { periods: [], dayOrders: {} };

  }



  /* ---------- STABILIZATION DELAY ---------- */

  await page.waitForTimeout(300);



  /* ---------- SCRAPE TIMETABLE ---------- */

  const data = await timetableFrame.evaluate((slotMap) => {

    const result = {
      periods: [],
      dayOrders: {}
    };

    const table = document.querySelector("table[border='5']");

    if (!table) return result;

    const rows = table.querySelectorAll("tr");



    /* ---------- GET PERIOD TIMINGS ---------- */

    const timeRow = rows[0].querySelectorAll("td");

    for (let i = 1; i < timeRow.length; i++) {
      result.periods.push(timeRow[i].innerText.trim());
    }



    /* ---------- PARSE DAY ORDERS ---------- */

    for (let r = 3; r < rows.length; r++) {

      const cols = rows[r].querySelectorAll("td");

      if (!cols || cols.length < 2) continue;

      const dayText = cols[0].innerText.trim();

      const dayMatch = dayText.match(/\d+/);

      if (!dayMatch) continue;

      const day = dayMatch[0];

      result.dayOrders[day] = [];

      for (let c = 1; c < cols.length; c++) {

        let slot = cols[c].innerText.trim();

        if (!slot) continue;

        slot = slot.split("/")[0].trim();

        const subject = slotMap[slot];

        result.dayOrders[day].push({
          period: c,
          slot,
          subject: subject ? subject.title : null,
          faculty: subject ? subject.faculty : null,
          room: subject ? subject.room : null
        });

      }

    }

    return result;

  }, slotMap);



  /* ---------- VALIDATION FALLBACK ---------- */

  if (!data.periods || data.periods.length === 0) {

    await page.waitForTimeout(1000);

    const retryTable = await timetableFrame.$("table[border='5']");

    if (retryTable) {

      return timetableFrame.evaluate((slotMap) => {

        const result = {
          periods: [],
          dayOrders: {}
        };

        const table = document.querySelector("table[border='5']");

        if (!table) return result;

        const rows = table.querySelectorAll("tr");

        const timeRow = rows[0].querySelectorAll("td");

        for (let i = 1; i < timeRow.length; i++) {
          result.periods.push(timeRow[i].innerText.trim());
        }

        return result;

      }, slotMap);

    }

  }



  return data;

};
