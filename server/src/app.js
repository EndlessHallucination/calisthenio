const express = require("express");
const app = express();
const skillsRouter = require("./routes/skills");
const profileRouter = require("./routes/profile");
const routineRouter = require("./routes/routines");

app.use(express.json());

app.use("/api/skills", skillsRouter);

app.use("/api/profile", profileRouter);

app.use("/api/routines", routineRouter);

app.get("/", (req, res) => {
  res.send("Hello");
});

module.exports = app;
