const service = require("./marks.service");

exports.getMarks = async (req, res) => {
  try {
    const data = await service.getMarks();
    res.json(data);
  } catch (err) {
    console.log("MARKS ERROR:", err);
    res.json({ error: "Marks fetch failed" });
  }
};