function buildRoutinePrompt({
  profile,
  skill,
  currentMilestone,
  nextMilestone,
  completedMilestones,
  availableExercises,
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
COMPLETED MILESTONES
=========================

${completed}

=========================
AVAILABLE EXERCISES
=========================

Use ONLY these exercises.

${exercises}

Do NOT invent exercise names.

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
