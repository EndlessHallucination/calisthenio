module.exports = async function seedMuscleUp(client) {
  await client.query(
    `
    INSERT INTO skills (name, category, difficulty, description)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (name) DO NOTHING
  `,
    [
      "Muscle-Up",
      "pulling",
      "intermediate",
      "A dynamic pulling skill where the athlete transitions from a pull-up position over the bar into a dip position. Requires explosive pulling power, transition strength, and pushing ability.",
    ],
  );

  const skillResult = await client.query(
    `SELECT id FROM skills WHERE name = $1`,
    ["Muscle-Up"],
  );
  const skillId = skillResult.rows[0].id;

  await client.query(
    `
    INSERT INTO milestones (skill_id, name, sequence, hold_time_seconds, reps_required, description, notes)
    VALUES
      ($1, 'Pull-up', 1, NULL, 5,
       'Perform 5 strict pull-ups with full range of motion from dead hang to chin over bar.',
       'Build foundational pulling strength before progressing.'),

      ($1, 'Chest-to-Bar Pull-up', 2, NULL, 5,
       'Perform 5 explosive chest-to-bar pull-ups where the chest reaches the bar.',
       'Focus on powerful vertical pulling and controlled movement.'),

      ($1, 'Muscle-Up Negative', 3, NULL, 3,
       'Perform 3 controlled negative muscle-ups from the top position through the transition.',
       'Develop strength and control in the transition phase.'),

      ($1, 'Kipping Muscle-Up', 4, NULL, 3,
       'Perform 3 kipping muscle-ups with a controlled transition over the bar.',
       'Learn the movement pattern before building strict strength.'),

      ($1, 'Muscle-Up', 5, NULL, 1,
       'Perform 1 clean muscle-up transitioning from below the bar into a stable top support position.',
       'Main milestone. Prioritize explosive pulling, fast transition, and strong lockout.')

    ON CONFLICT (skill_id, sequence) DO NOTHING
  `,
    [skillId],
  );

  await client.query(`
    INSERT INTO exercises (name, category, equipment, difficulty, description)
    VALUES
      ('Scap Pull-ups', 'pulling', 'Pull-up Bar', 'beginner',
       'Hang from a bar and activate the scapula by pulling the shoulders down without bending the elbows.'),

      ('Pull-ups', 'pulling', 'Pull-up Bar', 'beginner',
       'Perform strict pull-ups with full range of motion from dead hang to chin over bar.'),

      ('Chest-to-Bar Pull-ups', 'pulling', 'Pull-up Bar', 'intermediate',
       'Explosive pull-ups where the chest reaches the bar to build muscle-up pulling power.'),

      ('Explosive Pull-ups', 'pulling', 'Pull-up Bar', 'intermediate',
       'Pull as high as possible with maximum speed to develop explosive strength.'),

      ('Muscle-Up Negatives', 'pulling', 'Pull-up Bar', 'intermediate',
       'Start above the bar and slowly control the descent through the transition.'),

      ('Kipping Muscle-Ups', 'pulling', 'Pull-up Bar', 'intermediate',
       'Practice the muscle-up movement pattern using controlled momentum.'),

      ('Band Assisted Muscle-Ups', 'pulling', 'Pull-up Bar', 'intermediate',
       'Use resistance bands to practice the transition and improve technique.'),

      ('Straight Bar Dips', 'pushing', 'Pull-up Bar', 'intermediate',
       'Perform dips on a straight bar to strengthen the top position of the muscle-up.'),

      ('High Pull-ups', 'pulling', 'Pull-up Bar', 'advanced',
       'Pull explosively toward the lower chest or waist level.')

    ON CONFLICT (name) DO NOTHING
  `);

  const exercisesResult = await client.query(`SELECT id, name FROM exercises`);
  const exerciseMap = {};
  exercisesResult.rows.forEach((e) => (exerciseMap[e.name] = e.id));

  await client.query(
    `
    INSERT INTO skill_exercises (skill_id, exercise_id, purpose)
    VALUES
      ($1, $2, 'warmup'),
      ($1, $3, 'progression'),
      ($1, $4, 'progression'),
      ($1, $5, 'strength'),
      ($1, $6, 'progression'),
      ($1, $7, 'progression'),
      ($1, $8, 'progression'),
      ($1, $9, 'strength'),
      ($1, $10, 'strength')
    ON CONFLICT (skill_id, exercise_id, purpose) DO NOTHING
  `,
    [
      skillId,
      exerciseMap["Scap Pull-ups"],
      exerciseMap["Pull-ups"],
      exerciseMap["Chest-to-Bar Pull-ups"],
      exerciseMap["Explosive Pull-ups"],
      exerciseMap["Muscle-Up Negatives"],
      exerciseMap["Kipping Muscle-Ups"],
      exerciseMap["Band Assisted Muscle-Ups"],
      exerciseMap["Straight Bar Dips"],
      exerciseMap["High Pull-ups"],
    ],
  );

  console.log("Muscle-Up seeded.");
};
