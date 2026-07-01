const express = require("express");
const app = express();
const skillsRouter = require("./routes/skills");
const profileRouter = require("./routes/profile");

app.use(express.json());

app.use("/api/skills", skillsRouter);

app.use("/api/profile", profileRouter);

app.get("/", (req, res) => {
  res.send("Hello");
});

module.exports = app;
