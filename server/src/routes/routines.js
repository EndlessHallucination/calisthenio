const express = require("express");

const router = express.Router();

const {
  generateAndStoreRoutine,
  getActiveRoutine,
} = require("../services/routineService");

router.post("/generate", async (req, res) => {
  try {
    const routine = await generateAndStoreRoutine(req.body.skill_id);
    res.status(201).json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/active", async (req, res) => {
  try {
    const { skill_id } = req.query;

    if (!skill_id) {
      return res.status(400).json({ error: "skill_id is required" });
    }

    const routine = await getActiveRoutine(skill_id);

    if (!routine) {
      return res.status(404).json({ error: "No active routine found" });
    }

    res.json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
