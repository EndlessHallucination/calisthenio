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
  INSERT INTO milestones (
    skill_id,
    name,
    sequence,
    hold_time_seconds,
    reps_required,
    description,
    notes
  )
  VALUES
    ($1, 'Pull-up', 1, NULL, 5,
      'Perform 5 strict pull-ups with full range of motion from dead hang to chin over bar.',
      'Build foundational pulling strength and control before progressing.'),

    ($1, 'Chest-to-Bar Pull-up', 2, NULL, 5,
      'Perform 5 explosive chest-to-bar pull-ups where the chest reaches the bar.',
      'Focus on powerful vertical pulling and keeping the movement controlled.'),

    ($1, 'Muscle-Up Negative', 3, NULL, 3,
      'Perform 3 controlled negative muscle-ups from the top position through the transition.',
      'Develop strength and control in the transition phase.'),

    ($1, 'Kipping Muscle-Up', 4, NULL, 3,
      'Perform 3 kipping muscle-ups with a controlled transition over the bar.',
      'Learn the movement pattern before building strict strength.'),

    ($1, 'Muscle-Up', 5, NULL, 1,
      'Perform 1 clean muscle-up transitioning from below the bar into a stable top support position.',
      'Main milestone. Prioritize explosive pulling, fast transition, and strong lockout.'),

    ($1, 'Wide Muscle-Up', 6, NULL, 3,
      'Perform 3 muscle-ups using a wider grip position.',
      'Requires greater pulling strength due to reduced mechanical advantage.'),

    ($1, 'Strict Bar Muscle-Up', 7, NULL, 3,
      'Perform 3 strict muscle-ups without momentum or kipping.',
      'Requires powerful chest-to-bar pulling strength and controlled transition.'),

    ($1, 'L-Sit Muscle-Up', 8, NULL, 3,
      'Perform 3 muscle-ups while maintaining an L-sit position throughout the movement.',
      'Requires advanced core tension and strict pulling strength.'),

    ($1, 'One Arm Straight Muscle-Up', 9, NULL, 1,
      'Perform 1 one-arm straight muscle-up with controlled transition.',
      'Elite skill requiring exceptional pulling and straight-arm strength.'),

    ($1, 'High One Arm Pull-up', 10, NULL, 1,
      'Perform 1 high one-arm pull-up with enough height to support advanced muscle-up variations.',
      'Prerequisite movement for one-arm straight muscle-up progression.')

  ON CONFLICT (skill_id, sequence) DO NOTHING
`,
    [skillId],
  );

  await client.query(`
    INSERT INTO exercises (name, category, equipment, difficulty, description)
    VALUES
      ('Scap Pull-ups', 'pulling', 'bar', 'beginner', 'Hang from a bar and activate the scapula by pulling the shoulders down without bending the elbows.'),
      ('Pull-ups', 'pulling', 'bar', 'beginner', 'Perform strict pull-ups with full range of motion from dead hang to chin over bar.'),
      ('Chest-to-Bar Pull-ups', 'pulling', 'bar', 'intermediate', 'Explosive pull-ups where the chest reaches the bar to build muscle-up pulling power.'),
      ('Explosive Pull-ups', 'pulling', 'bar', 'intermediate', 'Pull as high as possible with maximum speed to develop explosive strength.'),
      ('Muscle-Up Negatives', 'pulling', 'bar', 'intermediate', 'Start above the bar and slowly control the descent through the transition.'),
      ('Kipping Muscle-Ups', 'pulling', 'bar', 'intermediate', 'Practice the muscle-up movement pattern using controlled momentum.'),
      ('Band Assisted Muscle-Ups', 'pulling', 'bar', 'intermediate', 'Use resistance bands to practice the transition and improve technique.'),
      ('Straight Bar Dips', 'pushing', 'bar', 'intermediate', 'Perform dips on a straight bar to strengthen the top position of the muscle-up.'),
      ('Weighted Pull-ups', 'pulling', 'bar', 'advanced', 'Add external weight to build maximum pulling strength.'),
      ('High Pull-ups', 'pulling', 'bar', 'advanced', 'Pull explosively toward the lower chest or waist level.'),
      ('L-Sit Pull-ups', 'pulling', 'bar', 'advanced', 'Perform strict pull-ups while maintaining an L-sit position.'),
      ('One Arm Pull-up Progressions', 'pulling', 'bar', 'elite', 'Progress toward one arm pulling strength required for advanced muscle-up variations.')
    ON CONFLICT (name) DO NOTHING
  `);

  const exercisesResult = await client.query(`SELECT id, name FROM exercises`);
  const exerciseMap = {};

  exercisesResult.rows.forEach((e) => {
    exerciseMap[e.name] = e.id;
  });

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
      ($1, $10, 'strength'),
      ($1, $11, 'strength'),
      ($1, $12, 'progression'),
      ($1, $13, 'strength')
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
      exerciseMap["Weighted Pull-ups"],
      exerciseMap["High Pull-ups"],
      exerciseMap["L-Sit Pull-ups"],
      exerciseMap["One Arm Pull-up Progressions"],
    ],
  );

  console.log("Muscle-Up seeded.");
};
