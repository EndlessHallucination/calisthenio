const { buildRoutineContext } = require("./contextService");
const { buildRoutinePrompt } = require("./promptBuilder");
const { generateRoutine } = require("./ollamaService");
const db = require("../config/db");

const parseHoldSeconds = (val) => {
  if (val === null || val === undefined) return null;
  const num = parseInt(val);
  return isNaN(num) ? null : num;
};

const generateAndStoreRoutine = async (skillId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const {
      profile,
      skill,
      skillProgress,
      currentMilestone,
      nextMilestone,
      completedMilestones,
      availableExercises,
      generalExercises,
      recentWorkouts,
      equipment,
      otherActiveSkills,
    } = await buildRoutineContext(skillId, client);

    const routinePrompt = buildRoutinePrompt({
      profile,
      skill,
      currentMilestone,
      nextMilestone,
      completedMilestones,
      availableExercises,
      recentWorkouts,
      equipment,
      otherActiveSkills,
      generalExercises,
    });

    const routineData = await generateRoutine(routinePrompt);

    await client.query(
      `UPDATE routines SET is_active = FALSE WHERE skill_progress_id = $1`,
      [skillProgress.id],
    );

    const versionResult = await client.query(
      `SELECT COALESCE(MAX(version), 0) + 1 AS next_version
       FROM routines WHERE skill_progress_id = $1`,
      [skillProgress.id],
    );
    const nextVersion = versionResult.rows[0].next_version;

    const routineResult = await client.query(
      `INSERT INTO routines (skill_progress_id, version, is_active)
       VALUES ($1, $2, TRUE) RETURNING *`,
      [skillProgress.id, nextVersion],
    );
    const routine = routineResult.rows[0];

    let orderIndex = 1;
    for (const section of routineData.sections) {
      for (const exercise of section.exercises) {
        const dbExercise =
          availableExercises.find((e) => e.name === exercise.exercise) ||
          generalExercises.find((e) => e.name === exercise.exercise);

        if (!dbExercise) {
          console.warn(`Exercise "${exercise.exercise}" not found.`);
          continue;
        }
        if (!exercise.reps && !exercise.hold_seconds) {
          console.warn(
            `Exercise "${exercise.exercise}" has no reps or hold time, skipping.`,
          );
          continue;
        }
        
        await client.query(
          `INSERT INTO routine_exercises (
            routine_id, exercise_id, order_index, sets, reps,
            hold_time_seconds, rest_seconds, notes, section
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            routine.id,
            dbExercise.id,
            orderIndex,
            exercise.sets,
            exercise.reps,
            parseHoldSeconds(exercise.hold_seconds),
            exercise.rest_seconds,
            exercise.notes,
            section.name,
          ],
        );
        orderIndex++;
      }
    }

    const exercises = await client.query(
      `SELECT re.*, e.name AS exercise_name, e.category, e.description
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

const getActiveRoutine = async (skillId) => {
  const result = await db.query(
    `SELECT
      r.*,
      json_agg(
        json_build_object(
          'id', re.id,
          'exercise_id', re.exercise_id,
          'order_index', re.order_index,
          'sets', re.sets,
          'reps', re.reps,
          'hold_time_seconds', re.hold_time_seconds,
          'rest_seconds', re.rest_seconds,
          'notes', re.notes,
          'section', re.section,
          'exercise_name', e.name,
          'category', e.category
        )
        ORDER BY re.order_index
      ) AS exercises
     FROM skill_progress sp
     JOIN routines r ON r.skill_progress_id = sp.id
     LEFT JOIN routine_exercises re ON re.routine_id = r.id
     LEFT JOIN exercises e ON e.id = re.exercise_id
     WHERE sp.skill_id = $1 AND r.is_active = TRUE
     GROUP BY r.id
     LIMIT 1`,
    [skillId],
  );
  return result.rows[0] || null;
};

module.exports = { generateAndStoreRoutine, getActiveRoutine };
