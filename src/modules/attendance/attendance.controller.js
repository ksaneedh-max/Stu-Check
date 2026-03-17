const service = require("./attendance.service");

exports.getAttendance = async (req, res) => {

  try {

    const sessionId = req.session.id;

    const data = await service.getAttendance(sessionId);

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};