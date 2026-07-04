const { getProfile } = require("./profileService");
const { getSkillById } = require("./skillService");
const {
  getCurrentMilestone,
  getNextMilestone,
} = require("./skillProgressService");
const { buildRoutinePrompt } = require("./promptBuilder");
const { generateRoutine } = require("./ollamaService");
const db = require("../config/db");

const generateAndStoreRoutine = async (skillId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const profile = await getProfile();

    const skill = await getSkillById(skillId);

    const skillProgressResult = await client.query(
      "SELECT * FROM skill_progress WHERE skill_id = $1",
      [skillId],
    );
    const skillProgress = skillProgressResult.rows[0];

    const currentMilestone = await getCurrentMilestone(skillId);

    const nextMilestone = await getNextMilestone(
      skillId,
      currentMilestone.sequence,
    );

    const completedMilestonesResult = await client.query(
      `SELECT * FROM user_milestones WHERE skill_progress_id = $1`,
      [skillProgress.id],
    );

    const completedMilestones = completedMilestonesResult.rows;

    const availableExercisesResult = await client.query(
      `SELECT e.* FROM exercises e
        JOIN skill_exercises se ON se.exercise_id = e.id
            WHERE se.skill_id = $1`,
      [skillId],
    );

    const availableExercises = availableExercisesResult.rows;

    const routinePrompt = buildRoutinePrompt({
      profile,
      skill,
      currentMilestone,
      nextMilestone,
      completedMilestones,
      availableExercises,
    });

    const routineData = await generateRoutine(routinePrompt);

    const markInactive = await client.query(
      `UPDATE routines 
     SET is_active = FALSE
     WHERE skill_progress_id = $1`,
      [skillProgress.id],
    );

    const versionResult = await client.query(
      `SELECT COALESCE(MAX(version), 0) + 1 AS next_version
     FROM routines
     WHERE skill_progress_id = $1`,
      [skillProgress.id],
    );
    const nextVersion = versionResult.rows[0].next_version;

    const routineResult = await client.query(
      `INSERT INTO routines (skill_progress_id, version, is_active)
     VALUES ($1, $2, TRUE)
     RETURNING *`,
      [skillProgress.id, nextVersion],
    );

    const routine = routineResult.rows[0];

    let orderIndex = 1;

    for (const section of routineData.sections) {
      for (const exercise of section.exercises) {
        const dbExercise = availableExercises.find(
          (e) => e.name === exercise.exercise,
        );

        if (!dbExercise) {
          console.warn(`Exercise "${exercise.exercise}" not found.`);
          continue;
        }

        await client.query(
          `
            INSERT INTO routine_exercises (
                routine_id,
                exercise_id,
                order_index,
                sets,
                reps,
                hold_time_seconds,
                rest_seconds,
                notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
          [
            routine.id,
            dbExercise.id,
            orderIndex,
            exercise.sets,
            exercise.reps,
            exercise.hold_seconds,
            exercise.rest_seconds,
            exercise.notes,
          ],
        );

        orderIndex++;
      }
    }
    const exercises = await client.query(
      `SELECT re.*, e.name as exercise_name, e.category, e.description
   FROM routine_exercises re
   JOIN exercises e ON e.id = re.exercise_id
   WHERE re.routine_id = $1
   ORDER BY re.order_index`,
      [routine.id],
    );

    await client.query("COMMIT");
    return { ...routine, exercises: exercises.rows };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { generateAndStoreRoutine };
