const db = require("../config/db");

const getAllSkills = async () => {
  const result = await db.query("SELECT * FROM skills");
  return result.rows;
};

const getSkillById = async (id) => {
  const skill = await db.query("SELECT * FROM skills WHERE id = $1", [id]);
  if (!skill.rows[0]) return null;

  const milestones = await db.query(
    "SELECT * FROM milestones WHERE skill_id = $1 ORDER BY sequence ASC",
    [id],
  );
  return {
    ...skill.rows[0],
    milestones: milestones.rows,
  };
};

const getActiveSkills = async () => {
  const result = await db.query(
    `SELECT s.*, sp.id as skill_progress_id, sp.status, sp.started_at
     FROM skills s
     JOIN skill_progress sp ON sp.skill_id = s.id
     WHERE sp.status = 'active'`,
  );
  return result.rows;
};

const getCompletedSkills = async () => {
  const result = await db.query(
    `SELECT s.*, sp.id as skill_progress_id, sp.status, sp.started_at
     FROM skills s
     JOIN skill_progress sp ON sp.skill_id = s.id
     WHERE sp.status = 'completed'`,
  );
  return result.rows;
};

const completeSkill = async (skillId) => {
  const result = await db.query(
    `
UPDATE skill_progress

SET
status='completed',
completed_at=NOW(),
updated_at=NOW()

WHERE skill_id=$1

RETURNING *
`,
    [skillId],
  );

  return result.rows[0];
};

const restartSkill = async (skillId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const progressResult = await client.query(
      `SELECT id FROM skill_progress WHERE skill_id = $1`,
      [skillId],
    );
    const skillProgressId = progressResult.rows[0]?.id;
    if (!skillProgressId) throw new Error("Skill not found");

    await client.query(
      `DELETE FROM user_milestones WHERE skill_progress_id = $1`,
      [skillProgressId],
    );

    const result = await client.query(
      `
      UPDATE skill_progress
      SET status = 'active',
          completed_at = NULL,
          updated_at = NOW()
      WHERE skill_id = $1
      RETURNING *
    `,
      [skillId],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllSkills,
  getSkillById,
  getActiveSkills,
  getCompletedSkills,
  completeSkill,
  restartSkill,
};
