exports.extract = async (page) => {
  let attendanceFrame = null;

  for (const frame of page.frames()) {
    const rows = await frame.locator("table tbody tr").count();

    if (rows > 0) {
      attendanceFrame = frame;
      break;
    }
  }

  return attendanceFrame.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr");

    const data = [];

    rows.forEach(row => {
      const cols = row.querySelectorAll("td");

      if (cols.length < 9) return;

      data.push({
        code: cols[0].innerText.trim(),
        title: cols[1].innerText.trim(),
        faculty: cols[3].innerText.trim(),
        slot: cols[4].innerText.trim(),
        room: cols[5].innerText.trim(),
        conducted: cols[6].innerText.trim(),
        absent: cols[7].innerText.trim(),
        attendance: cols[8].innerText.trim()
      });
    });

    return { courses: data };
  });
};