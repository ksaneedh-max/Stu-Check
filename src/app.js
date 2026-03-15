const express = require("express");

const loginRoutes = require("./modules/login/login.route");
const attendanceRoutes = require("./modules/attendance/attendance.route");
const marksRoutes = require("./modules/marks/marks.route");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

app.get("/", (req, res) => {
  res.send("SRM Dashboard API is running");
});

app.use("/login", loginRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/marks", marksRoutes);

module.exports = app;