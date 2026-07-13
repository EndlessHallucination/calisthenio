const express = require("express");
const cors = require("cors");

const app = express();
const skillsRouter = require("./routes/skills");
const profileRouter = require("./routes/profile");
const routineRouter = require("./routes/routines");
const workoutRouter = require("./routes/workouts");

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use("/api/skills", skillsRouter);

app.use("/api/profile", profileRouter);

app.use("/api/routines", routineRouter);

app.use("/api/workouts", workoutRouter);

app.use("/profile", profileRouter);

app.get("/", (req, res) => {
  res.send("Hello");
});

module.exports = app;
