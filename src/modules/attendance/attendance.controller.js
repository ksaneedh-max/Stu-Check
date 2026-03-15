const service = require("./attendance.service");

exports.getAttendance = async (req, res) => {
  try {
    const data = await service.getAttendance();
    res.json(data);
  } catch (err) {
    console.log("ATTENDANCE ERROR:", err);
    res.json({ error: "Attendance fetch failed" });
  }
};