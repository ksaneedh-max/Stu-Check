const express = require("express");
const controller = require("./login.controller");

const router = express.Router();

router.post("/", controller.login);
router.get("/status", controller.status);

module.exports = router;