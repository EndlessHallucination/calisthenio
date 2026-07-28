const express = require("express");
const router = express.Router();
const { generateAndStoreWeekPlan } = require("../services/weekPlanService");

router.post("/generate", async (req, res) => {
  try {
    const result = await generateAndStoreWeekPlan();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
