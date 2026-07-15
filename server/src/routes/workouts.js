const express = require("express");

const router = express.Router();

const {
  createWorkout,
  logExercises,
  getWorkouts,
  getWorkoutExercises,
  deleteWorkout,
} = require("../services/workoutService");

router.post("/", async (req, res) => {
  try {
    const { skill_id, date, duration_minutes, notes } = req.body;
    const result = await createWorkout(skill_id, date, duration_minutes, notes);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/exercises", async (req, res) => {
  try {
    const { exercises } = req.body;
    const result = await logExercises(req.params.id, exercises);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { skill_id } = req.query;
    const result = await getWorkouts(skill_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/exercises", async (req, res) => {
  try {
    const result = await getWorkoutExercises(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM workout_exercises WHERE workout_id = $1", [
      req.params.id,
    ]);
    await db.query("DELETE FROM workouts WHERE id = $1", [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
