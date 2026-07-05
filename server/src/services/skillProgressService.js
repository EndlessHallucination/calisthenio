const db = require("../config/db");

const startSkill = async (skillId) => {
  const existing = await db.query(
    `SELECT *
         FROM skill_progress
         WHERE skill_id = $1`,
    [skillId],
  );

  if (existing.rows.length === 0) {
    const result = await db.query(
      `INSERT INTO skill_progress (skill_id)
             VALUES ($1)
             RETURNING *`,
      [skillId],
    );
    return result.rows[0];
  }

  const progress = existing.rows[0];

  if (progress.status === "active") {
    throw new Error("Skill already in progress");
  }
  if (progress.status === "completed") {
    throw new Error("Skill already completed");
  }
  if (progress.status === "paused") {
    const result = await db.query(
      `UPDATE skill_progress
             SET status = 'active',
                 updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
      [progress.id],
    );
    return result.rows[0];
  }
};

const getCurrentMilestone = async (skillId) => {
  const progressResult = await db.query(
    `SELECT *
         FROM skill_progress
         WHERE skill_id = $1`,
    [skillId],
  );

  if (progressResult.rows.length === 0) {
    return null;
  }

  const skillProgressId = progressResult.rows[0].id;

  const milestoneResult = await db.query(
    `SELECT *
     FROM milestones m
     WHERE m.skill_id = $1
      AND NOT EXISTS (
      SELECT 1
      FROM user_milestones um
      WHERE um.skill_progress_id = $2
        AND um.milestone_id = m.id
      )
    ORDER BY m.sequence
    LIMIT 1;`,
    [skillId, skillProgressId],
  );

  return milestoneResult.rows[0] || null;
};

const getNextMilestone = async (skillId, currentSequence) => {
  const result = await db.query(
    `SELECT * FROM milestones 
     WHERE skill_id = $1 
     AND sequence = $2`,
    [skillId, currentSequence + 1],
  );
  return result.rows[0] || null;
};

const completeMilestone = async (skillProgressId, milestoneId) => {
  const existing = await db.query(
    `SELECT * FROM user_milestones WHERE skill_progress_id = $1 AND milestone_id = $2`,
    [skillProgressId, milestoneId],
  );

  if (existing.rows.length > 0) {
    throw new Error("Milestone already completed");
  }

  await db.query(
    `INSERT INTO user_milestones (skill_progress_id, milestone_id) VALUES ($1, $2)`,
    [skillProgressId, milestoneId],
  );

  const completedResult = await db.query(
    `SELECT COUNT(*) AS completed FROM user_milestones WHERE skill_progress_id = $1`,
    [skillProgressId],
  );

  const completed = Number(completedResult.rows[0].completed);

  const totalResult = await db.query(
    `SELECT COUNT(*) AS total
       FROM milestones
       WHERE skill_id = (
       SELECT skill_id
       FROM skill_progress
       WHERE id = $1
     )`,
    [skillProgressId],
  );

  const total = Number(totalResult.rows[0].total);

  if (completed === total) {
    await db.query(
      `UPDATE skill_progress
       SET status = 'completed',
           updated_at = NOW()
       WHERE id = $1`,
      [skillProgressId],
    );

    return {
      completed: true,
      message: "Skill completed!",
    };
  }
  return {
    completed: false,
    message: "Milestone completed. Generate next routine.",
  };
};

module.exports = {
  startSkill,
  getCurrentMilestone,
  getNextMilestone,
  completeMilestone,
};
