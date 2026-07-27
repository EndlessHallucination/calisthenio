const { buildRoutineContext } = require("./contextService");
const { buildWeekPlanPrompt } = require("./weekPlanPromptBuilder");
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

    // 5. mark previous week plan inactive
    // 6. store new week_plan
    // 7. store week_plan_skills
    // 8. store week_sessions and exercises
    // 9. commit and return

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { generateAndStoreWeekPlan };
