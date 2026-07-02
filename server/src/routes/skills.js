const express = require("express");

const router = express.Router();

const { getAllSkills, getSkillById } = require("../services/skillService");
const { startSkill, getCurrentMilestone } = require("../services/skillProgressService");

router.get("/", async (req, res) => {
  try {
    const result = await getAllSkills();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await getSkillById(req.params.id);
    if (!result) return res.status(404).json({ error: "Skill not found" });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/start", async (req, res) => {
  try {
    const result = await startSkill(req.params.id);
    if (!result) return res.status(404).json({ error: "Skill not found" });
    res.status(201).json(result);
  } catch (error) {
    if (
      error.message === "Skill already in progress" ||
      error.message === "Skill already completed"
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/current-milestone", async (req, res) => {
  try {
    const milestone = await getCurrentMilestone(req.params.id);
    if (!milestone)
      return res.status(404).json({ error: "No active milestone found" });
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
