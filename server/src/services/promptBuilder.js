function buildRoutinePrompt({
  profile,
  skill,
  currentMilestone,
  nextMilestone,
  completedMilestones,
  availableExercises,
  recentWorkouts,
  equipment,
}) {
  const completed =
    completedMilestones.length > 0
      ? completedMilestones
          .map(
            (m) =>
              `- ${m.name} (completed ${new Date(m.completed_at).toLocaleDateString()})`,
          )
          .join("\n")
      : "- None";

  const exercises = availableExercises
    .map(
      (e) =>
        `- ${e.name} (${e.category}${e.equipment ? `, ${e.equipment}` : ""})`,
    )
    .join("\n");

  const recent =
    recentWorkouts.length > 0
      ? recentWorkouts
          .map((workout) => {
            const date = new Date(workout.workout_date).toLocaleDateString();

            const performed = workout.exercises
              .map((exercise) => {
                const performance =
                  exercise.hold_seconds != null
                    ? `${exercise.sets} sets, ${exercise.hold_seconds} seconds`
                    : `${exercise.sets} sets, ${exercise.reps} reps`;

                return `${exercise.name} — ${performance}`;
              })
              .join(". ");

            return `- ${date}: ${performed}.`;
          })
          .join("\n")
      : "- No previous workouts.";

  return `
You are an elite calisthenics coach specializing in bodyweight strength, skill progression, and injury prevention.

Your task is to design ONE training routine that helps the athlete progress toward the next milestone as efficiently and safely as possible.

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
CURRENT SKILL
=========================

Skill:
${skill.name}

Description:
${skill.description}

=========================
CURRENT PROGRESSION
=========================

Current Milestone:
• ${currentMilestone.name}
• Required Hold: ${currentMilestone.hold_time_seconds} seconds
• Progression Stage: ${currentMilestone.sequence}

${
  nextMilestone
    ? `Next Milestone:
• ${nextMilestone.name}
• Required Hold: ${nextMilestone.hold_time_seconds} seconds`
    : `The athlete has already reached the final milestone.
Focus on increasing strength, hold time, control and consistency.`
}


=========================
CONCURRENT SKILLS
=========================
${
  otherActiveSkills.length > 0
    ? `The athlete is also training:\n${otherActiveSkills.map((s) => `- ${s.name} (${s.category})`).join("\n")}\n\nConsider recovery and avoid overloading the same muscle groups.`
    : "No other skills currently being trained."
}


=========================
COMPLETED MILESTONES
=========================

${completed}

=========================
RECENT WORKOUTS
=========================

Last 3 workouts:

${recent}

Use these workouts to:
• Avoid repeating the exact same session.
• Apply progressive overload where appropriate.
• Continue progressing from the previous sessions.
• Balance intensity and recovery.

=========================
AVAILABLE EXERCISES
=========================

Use ONLY these exercises.

${exercises}

Do NOT invent exercise names.


=========================
AVAILABLE EQUIPMENT
=========================
The athlete has access to:
${equipment.length > 0 ? equipment.map((e) => `- ${e}`).join("\n") : "- Bodyweight only"}

Only prescribe exercises that can be performed with this equipment.

=========================
COACHING PRINCIPLES
=========================

Create a routine that:

• Fits within ${profile.session_duration_minutes} minutes.
• Matches the athlete's experience level.
• Prioritizes skill work while fresh.
• Includes enough volume for progress without excessive fatigue.
• Uses progressive overload principles.
• Builds strength specific to ${skill.name}.
• Takes previous workouts into account.
• Avoids repeating the exact same routine unless appropriate.
• Includes accessory work for weak links.
• Includes appropriate rest periods.
• Includes a short warm-up.
• Includes a short cooldown.
• Avoids unnecessary exercises.
• Uses only exercises from the provided list.

=========================
ROUTINE STRUCTURE
=========================

1. Warm-up
2. Skill Practice
3. Main Strength
4. Accessories
5. Cooldown

=========================
OUTPUT RULES
=========================

Return ONLY valid JSON.

Do NOT write markdown.

Do NOT explain your decisions.

Do NOT include text before or after the JSON.

Use this exact schema:

{
  "title": "string",
  "goal": "string",
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
  ],
  "coach_notes": "string"
}

The response MUST be valid JSON.
`;
}

module.exports = { buildRoutinePrompt };
