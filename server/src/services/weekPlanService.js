const { buildRoutineContext } = require("./contextService");
const { buildWeekPlanPrompt } = require("./weekPromptBuilder");
const { generateWeekPlan } = require("./ollamaService");
const { getActiveSkills } = require("./skillService");
const db = require("../config/db");

const parseHoldSeconds = (val) => {
  if (val === null || val === undefined) return null;
  const num = parseInt(val);
  return isNaN(num) ? null : num;
};

const generateAndStoreWeekPlan = async () => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. get all active skill_progress rows
    const activeSkills = await getActiveSkills();
    // 2. for each skill, build context
    const contexts = [];
    for (const skill of activeSkills) {
      const context = await buildRoutineContext(skill.id, client);
      contexts.push(context);
    }
    // 3. build the week plan prompt
    const prompt = buildWeekPlanPrompt(contexts);

    // 4. call ollama

    const weekPlanData = await generateWeekPlan(prompt);
    console.log("Sessions count:", weekPlanData?.sessions?.length);
    console.log(
      "First session:",
      JSON.stringify(weekPlanData?.sessions?.[0], null, 2),
    );
    // 5. mark previous week plan inactive
    await client.query(`
      UPDATE week_plans SET is_active = FALSE
      WHERE is_active = TRUE
    `);
    // 6. store new week_plan
    const weekPlanResult = await client.query(
      `
        INSERT INTO week_plans (version, is_active, coach_notes)
        VALUES (
        COALESCE((SELECT MAX(version) FROM week_plans), 0) + 1,
        TRUE, $1
    )
        RETURNING *
      `,
      [weekPlanData.coach_notes || null],
    );

    const weekPlan = weekPlanResult.rows[0];
    // 7. store week_plan_skills
    for (const ctx of contexts) {
      await client.query(
        `
        INSERT INTO week_plan_skills (week_plan_id, skill_progress_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING
        `,
        [weekPlan.id, ctx.skillProgress.id],
      );
    }
    // 8. store week_sessions and exercises
    for (const session of weekPlanData.sessions) {
      // find matching context for this session
      const ctx =
        contexts.find((c) => c.skill.name === session.skill) || contexts[0];
      const allExercises = [...ctx.availableExercises, ...ctx.generalExercises];

      const sessionResult = await client.query(
        `
    INSERT INTO week_sessions (week_plan_id, label, skill_id, order_index)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
        [
          weekPlan.id,
          session.label,
          ctx.skill.id,
          session.label.charCodeAt(0) - 65,
        ],
      );

      const weekSession = sessionResult.rows[0];

      let orderIndex = 1;
      for (const section of session.sections) {
        for (const exercise of section.exercises) {
          const dbExercise = allExercises.find(
            (e) => e.name === exercise.exercise,
          );

          if (!dbExercise) {
            console.warn(
              `Exercise "${exercise.exercise}" not found, skipping.`,
            );
            continue;
          }

          await client.query(
            `
        INSERT INTO week_session_exercises (
          week_session_id, exercise_id, order_index,
          sets, reps, hold_time_seconds, rest_seconds, notes, section
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
            [
              weekSession.id,
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
    }
    // 9. commit and return

    await client.query("COMMIT");

    return weekPlan;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Week plan generation failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
};

const getActiveWeekPlan = async () => {
  const result = await db.query(`
    SELECT
      wp.*,
      json_agg(
        json_build_object(
          'id', ws.id,
          'label', ws.label,
          'skill_id', ws.skill_id,
          'order_index', ws.order_index,
          'exercises', (
            SELECT json_agg(
              json_build_object(
                'id', wse.id,
                'exercise_id', wse.exercise_id,
                'exercise_name', e.name,
                'category', e.category,
                'order_index', wse.order_index,
                'sets', wse.sets,
                'reps', wse.reps,
                'hold_time_seconds', wse.hold_time_seconds,
                'rest_seconds', wse.rest_seconds,
                'notes', wse.notes,
                'section', wse.section
              ) ORDER BY wse.order_index
            )
            FROM week_session_exercises wse
            JOIN exercises e ON e.id = wse.exercise_id
            WHERE wse.week_session_id = ws.id
          )
        ) ORDER BY ws.order_index
      ) AS sessions
    FROM week_plans wp
    LEFT JOIN week_sessions ws ON ws.week_plan_id = wp.id
    WHERE wp.is_active = TRUE
    GROUP BY wp.id
    LIMIT 1
  `);
  return result.rows[0] || null;
};

module.exports = { generateAndStoreWeekPlan, getActiveWeekPlan };
