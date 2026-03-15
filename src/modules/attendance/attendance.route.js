const express = require("express");
const controller = require("./attendance.controller");

const router = express.Router();

router.get("/", controller.getAttendance);

module.exports = router;