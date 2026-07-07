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

module.exports = { getAllSkills, getSkillById, getActiveSkills };
