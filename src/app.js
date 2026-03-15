const express = require("express");

const loginRoutes = require("./modules/login/login.route");
const logoutRoutes = require("./modules/logout/logout.route");
const attendanceRoutes = require("./modules/attendance/attendance.route");
const marksRoutes = require("./modules/marks/marks.route");

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* ---------- REQUEST LOGGER ---------- */

app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

/* ---------- HEALTH CHECK ---------- */

app.get("/", (req, res) => {
  res.send("SRM Dashboard API is running");
});

/* ---------- ROUTES ---------- */

app.use("/login", loginRoutes);
app.use("/logout", logoutRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/marks", marksRoutes);

module.exports = app;
