const express = require("express");

const router = express.Router();
const db = require("../config/db");

const { generateAndStoreRoutine } = require("../services/routineService");

const {
  getAllSkills,
  getSkillById,
  getActiveSkills,
  getCompletedSkills,
  completeSkill,
  restartSkill,
} = require("../services/skillService");

const {
  startSkill,
  getCurrentMilestone,
  completeMilestone,
} = require("../services/skillProgressService");

router.get("/", async (req, res) => {
  try {
    const result = await getAllSkills();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/active", async (req, res) => {
  try {
    const result = await getActiveSkills();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/completed", async (req, res) => {
  try {
    const result = await getCompletedSkills();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id/complete", async (req, res) => {
  try {
    const skill = await completeSkill(req.params.id);

    if (!skill) {
      return res.status(404).json({
        error: "Skill progress not found",
      });
    }

    res.json(skill);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
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

router.post("/:id/milestones/:milestoneId/complete", async (req, res) => {
  try {
    const skillId = req.params.id;
    const milestoneId = req.params.milestoneId;

    const progressResult = await db.query(
      `SELECT * FROM skill_progress WHERE skill_id = $1`,
      [skillId],
    );

    if (!progressResult.rows[0]) {
      return res.status(404).json({ error: "Skill not started" });
    }

    const skillProgressId = progressResult.rows[0].id;
    const result = await completeMilestone(skillProgressId, milestoneId);

    if (!result.completed) {
      const routine = await generateAndStoreRoutine(skillId);
      return res.json({ ...result, routine });
    }

    res.json(result);
  } catch (error) {
    if (error.message === "Milestone already completed") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id/restart", async (req, res) => {
  try {
    const result = await restartSkill(req.params.id);
    if (!result) return res.status(404).json({ error: "Skill not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
