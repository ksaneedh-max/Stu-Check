const express = require("express");
const controller = require("./marks.controller");

const router = express.Router();

router.get("/", controller.getMarks);

module.exports = router;