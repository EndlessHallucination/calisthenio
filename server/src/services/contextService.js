const db = require("../config/db");
const { getProfile } = require("./profileService");
const { getSkillById } = require("./skillService");
const {
  getCurrentMilestone,
  getNextMilestone,
} = require("./skillProgressService");

const buildRoutineContext = async (skillId, client) => {
  const profile = await getProfile();
  const skill = await getSkillById(skillId);

  const skillProgressResult = await client.query(
    `SELECT * FROM skill_progress WHERE skill_id = $1`,
    [skillId],
  );
  const skillProgress = skillProgressResult.rows[0];

  const currentMilestone = await getCurrentMilestone(skillId);
  const nextMilestone = await getNextMilestone(
    skillId,
    currentMilestone.sequence,
  );

  // completed milestones
  const completedMilestonesResult = await client.query(
    `SELECT * FROM user_milestones WHERE skill_progress_id = $1`,
    [skillProgress.id],
  );
  const completedMilestones = completedMilestonesResult.rows;

  //total milestones
  const milestonesResult = await client.query(
    `SELECT COUNT(*) as total FROM milestones WHERE skill_id = $1`,
    [skillId],
  );
  const totalMilestones = parseInt(milestonesResult.rows[0].total);

  // available exercises

  const availableExercisesResult = await client.query(
    `SELECT e.*
       FROM exercises e
       JOIN skill_exercises se ON se.exercise_id = e.id
       WHERE se.skill_id = $1`,
    [skillId],
  );
  const availableExercises = availableExercisesResult.rows;

  // general exercises
  const generalExercisesResult = await client.query(`
            SELECT e.* FROM exercises e
            WHERE e.id NOT IN (SELECT exercise_id FROM skill_exercises)
        `);

  // recent workouts
  const recentWorkoutsResult = await client.query(
    `SELECT
        w.id AS workout_id,
        w.workout_date,
        re.order_index,
        e.name AS exercise_name,
        we.actual_sets,
        we.actual_reps,
        we.actual_hold_time_seconds
       FROM workouts w
       JOIN workout_exercises we ON we.workout_id = w.id
       JOIN routine_exercises re ON re.id = we.routine_exercise_id
       JOIN exercises e ON e.id = re.exercise_id
       WHERE w.skill_progress_id = $1
       ORDER BY w.workout_date DESC, re.order_index ASC`,
    [skillProgress.id],
  );

  const workoutsMap = new Map();
  for (const row of recentWorkoutsResult.rows) {
    if (!workoutsMap.has(row.workout_id)) {
      if (workoutsMap.size >= 3) continue;
      workoutsMap.set(row.workout_id, {
        workout_date: row.workout_date,
        exercises: [],
      });
    }
    workoutsMap.get(row.workout_id).exercises.push({
      name: row.exercise_name,
      sets: row.actual_sets,
      reps: row.actual_reps,
      hold_seconds: row.actual_hold_time_seconds,
    });
  }
  const recentWorkouts = [...workoutsMap.values()];

  // equipment

  const equipmentResult = await client.query(`
      SELECT e.name
      FROM equipment e
      JOIN profile_equipment pe ON pe.equipment_id = e.id
      WHERE pe.profile_id = 1
    `);
  const equipment = equipmentResult.rows.map((e) => e.name);

  const generalExercises = generalExercisesResult.rows.filter(
    (e) =>
      !e.equipment ||
      e.equipment === "Bodyweight" ||
      equipment.includes(e.equipment),
  );

  return {
    profile,
    skill,
    skillProgress,
    currentMilestone,
    totalMilestones,
    nextMilestone,
    completedMilestones,
    availableExercises,
    generalExercises,
    recentWorkouts,
    equipment,
  };
};

module.exports = { buildRoutineContext };
