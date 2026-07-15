const db = require("../config/db");

const createWorkout = async (skillId, date, durationMinutes, notes) => {
  const progressResult = await db.query(
    `SELECT id FROM skill_progress WHERE skill_id = $1`,
    [skillId],
  );

  const skillProgressId = progressResult.rows[0]?.id;
  if (!skillProgressId) throw new Error("Skill not started");

  const result = await db.query(
    `INSERT INTO workouts (skill_progress_id, workout_date, duration_minutes, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [skillProgressId, date || new Date(), durationMinutes, notes],
  );

  return result.rows[0];
};

const logExercises = async (workoutId, exercises) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (const exercise of exercises) {
      await client.query(
        `INSERT INTO workout_exercises (workout_id,
            routine_exercise_id,
            actual_sets,
            actual_reps,
            actual_hold_time_seconds,
            completed    )
            VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          workoutId,
          exercise.routine_exercise_id,
          exercise.actual_sets,
          exercise.actual_reps,
          exercise.actual_hold_time_seconds,
          exercise.completed,
        ],
      );
    }
    const logged = await client.query(
      `SELECT * FROM workout_exercises WHERE workout_id = $1`,
      [workoutId],
    );

    await client.query("COMMIT");
    return logged.rows;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getWorkouts = async (skillId) => {
  const progressResult = await db.query(
    `SELECT id FROM skill_progress WHERE skill_id = $1`,
    [skillId],
  );

  const skillProgressId = progressResult.rows[0]?.id;

  const result = await db.query(
    `SELECT * FROM workouts WHERE skill_progress_id = $1 ORDER BY workout_date DESC`,
    [skillProgressId],
  );

  return result.rows;
};

const getWorkoutExercises = async (workoutId) => {
  const result = await db.query(
    `
    SELECT 
      we.*,
      e.name as exercise_name,
      e.category
    FROM workout_exercises we
    JOIN routine_exercises re ON re.id = we.routine_exercise_id
    JOIN exercises e ON e.id = re.exercise_id
    WHERE we.workout_id = $1
    ORDER BY we.id
  `,
    [workoutId],
  );
  return result.rows;
};

module.exports = {
  createWorkout,
  logExercises,
  getWorkouts,
  getWorkoutExercises,
};
