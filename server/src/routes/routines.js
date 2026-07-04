const express = require("express");

const router = express.Router();

const { generateAndStoreRoutine } = require("../services/routineService");

router.post("/generate", async (req, res) => {
  try {
    const routine = await generateAndStoreRoutine(req.body.skill_id);
    res.status(201).json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
