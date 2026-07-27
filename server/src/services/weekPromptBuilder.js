function buildWeekPlanPrompt(contexts) {
  const isSingleSkill = contexts.length === 1;

  const skillSummaries = contexts
    .map((ctx, i) => {
      const label = String.fromCharCode(65 + i);
      return `
      
Session ${label} — ${ctx.skill.name}
Current Milestone: ${ctx.currentMilestone.name}
${
  ctx.currentMilestone.hold_time_seconds
    ? `Required Hold: ${ctx.currentMilestone.hold_time_seconds}s`
    : ctx.currentMilestone.reps_required
      ? `Required Reps: ${ctx.currentMilestone.reps_required}`
      : ""
}

Progression Stage: ${ctx.currentMilestone.sequence} of ${ctx.totalMilestones}
Available Exercises: 
${ctx.availableExercises.map((e) => `- ${e.name}`).join("\n")}
    `;
    })
    .join("\n");
  const recentBySkill = contexts
    .map((ctx, i) => {
      const label = String.fromCharCode(65 + i);
      if (ctx.recentWorkouts.length === 0)
        return `Session ${label} — No previous workouts.`;
      return (
        `Session ${label} — ${ctx.skill.name}:\n` +
        ctx.recentWorkouts
          .map((w) => {
            const date = new Date(w.workout_date).toLocaleDateString();
            const exs = w.exercises
              .map((e) => `  ${e.name}: ${e.sets} sets`)
              .join("\n");
            return `- ${date}:\n${exs}`;
          })
          .join("\n")
      );
    })
    .join("\n\n");
  const profile = contexts[0].profile;
  const equipment = contexts[0].equipment;

  const general =
    contexts[0].generalExercises
      .map(
        (e) =>
          `- ${e.name} (${e.category}${e.equipment ? `, ${e.equipment}` : ""})`,
      )
      .join("\n") || "- None";

  const cooldownExercises =
    contexts[0].generalExercises
      .filter((e) => e.category === "mobility")
      .map((e) => `- ${e.name}`)
      .join("\n") || "- None";
  return `
You are an elite calisthenics coach specializing in bodyweight strength, skill progression, and injury prevention.

Your task is to design ONE WEEKLY TRAINING PLAN.

The plan consists of TWO training sessions.

${
  isSingleSkill
    ? `
The athlete is currently focusing on ONE skill.

Session A should prioritize the selected skill.

Session B should reinforce the same goal using complementary strength, mobility, stability and accessory work without simply repeating Session A.
`
    : `
The athlete is currently training TWO skills.

Session A should focus entirely on the first skill.

Session B should focus entirely on the second skill.

Avoid excessive overlap in fatigue between the two sessions.
`
}

=========================
ATHLETE PROFILE
=========================

Experience Level:
${profile.experience}

Training Days Per Week:
${profile.days_per_week}

Maximum Session Duration:
${profile.session_duration_minutes} minutes

=========================
AVAILABLE EQUIPMENT
=========================

The athlete has access to:

${
  equipment.length
    ? equipment.map((e) => `- ${e}`).join("\n")
    : "- Bodyweight only"
}

Only prescribe exercises that can be performed with this equipment.

=========================
GENERAL EXERCISES
=========================

These exercises may ONLY be used for:

• Warm-up
• Cooldown

Never use them as the main skill work.

${general}

=========================
COOLDOWN EXERCISES
=========================

Cooldown may ONLY use these exercises.

${cooldownExercises}

=========================
TRAINING CONTEXT
=========================

${skillSummaries}

=========================
RECENT WORKOUTS
=========================
Use these to avoid repeating sessions and apply progressive overload.

${recentBySkill}

=========================
PROGRESSION RULES
=========================

For EACH session:

• Only prescribe exercises at or BELOW the athlete's current milestone.
• Never prescribe exercises from future milestones.
• Never invent exercise names.
• Use ONLY exercises listed for that skill.
• Respect the available equipment.
• Prioritize technique before volume.
• Skill work must always come before strength work.
• Progress conservatively.
• Do not prescribe impossible hold durations.
• Use specific rep ranges such as 5 or 6-8.
• Never use "Max", "AMRAP", "Until failure", or vague prescriptions.

=========================
SESSION DESIGN
=========================

Every session should include:

1. Warm-up
2. Skill Practice
3. Main Strength
4. Accessories
5. Cooldown

Each session should:

• Fit within ${profile.session_duration_minutes} minutes.
• Match the athlete's experience level.
• Include appropriate rest periods.
• Avoid unnecessary exercises.
• Finish with mobility/stretching only.

Cooldown rules:

• 2-3 exercises
• Static stretching or mobility only
• Hold each stretch 30-60 seconds
• No strength exercises
• No skill practice
• No push-ups
• No pull-ups
• No squats

=========================
WEEKLY BALANCE
=========================

Think about the week as a whole.

Do NOT make Session A and Session B nearly identical.

Balance:

• Pulling and pushing volume
• Grip fatigue
• Shoulder fatigue
• Core fatigue
• Recovery

If only ONE skill is trained:

• Session A should emphasize skill progression.
• Session B should strengthen limiting muscles and movement patterns.
• Session B may include different accessory emphasis while still supporting progression.

If TWO skills are trained:

• Keep each session dedicated to its own skill.
• Avoid excessive overlap in heavy accessory work.
• Consider cumulative fatigue across the week.

=========================
OUTPUT RULES
=========================

Return ONLY valid JSON.

Do NOT write markdown.

Do NOT explain your reasoning.

Do NOT include any text before or after the JSON.

Use ONLY exact exercise names from the provided exercise lists.

Do NOT modify exercise names.

All numeric values must be whole integers.

rest_seconds is required for every exercise.

For strength exercises:
• provide either reps OR hold_seconds.

For stretching:
• hold_seconds must be between 30 and 60.

Use this exact schema:

{
  "coach_notes": "string",
  "sessions": [
    {
      "label": "A",
      "skill": "string",
      "title": "string",
      "estimated_duration_minutes": number,
      "sections": [
        {
          "name": "Warm-up",
          "exercises": [
            {
              "exercise": "string",
              "sets": number,
              "reps": "string or null",
              "hold_seconds": number or null,
              "rest_seconds": number,
              "notes": "string"
            }
          ]
        }
      ]
    },
    {
      "label": "B",
      "skill": "string",
      "title": "string",
      "estimated_duration_minutes": number,
      "sections": [
        {
          "name": "Warm-up",
          "exercises": [
            {
              "exercise": "string",
              "sets": number,
              "reps": "string or null",
              "hold_seconds": number or null,
              "rest_seconds": number,
              "notes": "string"
            }
          ]
        }
      ]
    }
  ]
}

The response MUST be valid JSON.
`;
}

module.exports = { buildWeekPlanPrompt };
