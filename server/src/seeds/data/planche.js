module.exports = async function seedPlanche(client) {
  await client.query(
    `
    INSERT INTO skills (name, category, difficulty, description)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (name) DO NOTHING
  `,
    [
      "Planche",
      "pushing",
      "advanced",
      "An advanced straight-arm pushing skill where the body is held horizontally parallel to the ground with the feet elevated. Requires exceptional shoulder strength, wrist conditioning, scapular control, and core tension.",
    ],
  );

  const skillResult = await client.query(
    `SELECT id FROM skills WHERE name = $1`,
    ["Planche"],
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

      ($1, 'Planche Lean', 1, 30, NULL,
      'Hold a forward-leaning plank position with straight arms and shoulders past the wrists.',
      'Build wrist tolerance and straight-arm pushing strength.'),

      ($1, 'Straight Arm Frog Stand', 2, 10, NULL,
      'Hold a frog stand position while keeping the elbows locked and arms straight.',
      'Develop balance, wrist strength, and scapular protraction.'),

      ($1, 'Tuck Planche', 3, 10, NULL,
      'Hold a tuck planche position with knees pulled toward the chest while keeping arms straight.',
      'Focus on pushing the floor away and maintaining a rounded upper back.'),

      ($1, 'Advanced Tuck Planche', 4, 10, NULL,
      'Hold an advanced tuck planche with hips more extended and body closer to horizontal.',
      'Increase shoulder lean and maintain strong scapular control.'),

      ($1, 'Ring Tuck Planche', 5, 10, NULL,
      'Hold a tuck planche position on rings.',
      'Develop additional stability and control.'),

      ($1, 'Tuck Planche Push-up', 6, NULL, 5,
      'Perform push-ups while maintaining a tuck planche position.',
      'Build pressing strength specific to planche.'),

      ($1, 'Advanced Tuck Planche Push-up', 7, NULL, 5,
      'Perform push-ups from an advanced tuck planche position.',
      'Maintain body tension and controlled movement.'),

      ($1, 'Elbow Lever', 8, 10, NULL,
      'Balance the body horizontally using the elbows as support points.',
      'Accessory skill for balance, wrist strength, and body awareness.'),

      ($1, 'One Arm Elbow Lever', 9, 5, NULL,
      'Hold an elbow lever using one arm for support.',
      'Advanced accessory movement requiring unilateral control.'),

      ($1, 'One Leg Planche', 10, 5, NULL,
      'Hold a planche position with one leg extended and one leg tucked.',
      'Bridge progression between tuck variations and full planche.'),

      ($1, 'Straddle Planche', 11, 5, NULL,
      'Hold a straddle planche with both legs extended apart.',
      'Reduce leverage gradually before attempting full planche.'),

      ($1, 'Straddle Planche Push-up', 12, NULL, 3,
      'Perform push-ups while maintaining a straddle planche position.',
      'Requires advanced planche strength and pressing ability.'),

      ($1, 'Planche', 13, 5, NULL,
      'Hold a full planche position with straight arms and body parallel to the ground.',
      'Main planche milestone. Requires maximum straight-arm pushing strength.'),

      ($1, 'Straight Arm Straddle Planche to Handstand', 14, NULL, 1,
      'Transition from a straddle planche directly into a handstand.',
      'Requires advanced shoulder mobility, compression, and control.'),

      ($1, 'Planche Push-up', 15, NULL, 3,
      'Perform push-ups while maintaining a full planche position.',
      'Elite pushing strength milestone.'),

      ($1, 'Ring Planche', 16, 5, NULL,
      'Hold a full planche position on rings.',
      'Requires extreme ring stability and straight-arm strength.'),

      ($1, 'Ring Planche Push-up', 17, NULL, 3,
      'Perform planche push-ups on rings.',
      'Elite-level pushing and stabilization skill.'),

      ($1, 'Maltese', 18, 5, NULL,
      'Hold a Maltese position with arms extended horizontally.',
      'One of the highest straight-arm strength elements.')

    ON CONFLICT (skill_id, sequence) DO NOTHING
  `,
    [skillId],
  );

  await client.query(`
    INSERT INTO exercises (
      name,
      category,
      equipment,
      difficulty,
      description
    )
    VALUES

      ('Wrist Conditioning', 'mobility', 'bodyweight', 'beginner',
      'Prepare wrists for planche training through mobility and strengthening drills.'),

      ('Scapular Push-ups', 'pushing', 'bodyweight', 'beginner',
      'Perform push-ups focusing on scapular movement without bending the elbows.'),

      ('Planche Lean', 'pushing', 'bodyweight', 'beginner',
      'Lean forward in a push-up position while maintaining straight arms.'),

      ('Straight Arm Frog Stand', 'pushing', 'bodyweight', 'beginner',
      'Practice balance with straight arms while supporting the knees on the arms.'),

      ('Tuck Planche Hold', 'pushing', 'bodyweight', 'intermediate',
      'Hold a tuck planche position with straight arms and protracted shoulders.'),

      ('Advanced Tuck Planche Hold', 'pushing', 'bodyweight', 'intermediate',
      'Hold an advanced tuck planche with increased body extension.'),

      ('Pseudo Planche Push-ups', 'pushing', 'bodyweight', 'intermediate',
      'Perform push-ups with shoulders leaning forward to mimic planche mechanics.'),

      ('Tuck Planche Push-ups', 'pushing', 'bodyweight', 'advanced',
      'Perform push-ups while maintaining tuck planche position.'),

      ('Straddle Planche Hold', 'pushing', 'bodyweight', 'advanced',
      'Hold a straddle planche with legs extended apart.'),

      ('Straddle Planche Push-ups', 'pushing', 'bodyweight', 'advanced',
      'Perform push-ups while maintaining a straddle planche.'),

      ('Full Planche Hold', 'pushing', 'bodyweight', 'elite',
      'Hold a full planche with straight arms and horizontal body position.'),

      ('Planche Push-ups', 'pushing', 'bodyweight', 'elite',
      'Perform push-ups while maintaining full planche position.'),

      ('Elbow Lever', 'pushing', 'bodyweight', 'intermediate',
      'Balance horizontally using the elbows as support points.'),

      ('One Arm Elbow Lever', 'pushing', 'bodyweight', 'advanced',
      'Perform an elbow lever using one arm for support.'),

      ('Maltese Progressions', 'pushing', 'rings', 'elite',
      'Develop straight-arm strength required for Maltese.')

    ON CONFLICT (name) DO NOTHING
  `);

  const exercisesResult = await client.query(`SELECT id, name FROM exercises`);

  const exerciseMap = {};

  exercisesResult.rows.forEach((e) => {
    exerciseMap[e.name] = e.id;
  });

  await client.query(
    `
    INSERT INTO skill_exercises (
      skill_id,
      exercise_id,
      purpose
    )
    VALUES

      ($1, $2, 'warmup'),
      ($1, $3, 'warmup'),
      ($1, $4, 'progression'),
      ($1, $5, 'progression'),
      ($1, $6, 'progression'),
      ($1, $7, 'strength'),
      ($1, $8, 'strength'),
      ($1, $9, 'progression'),
      ($1, $10, 'progression'),
      ($1, $11, 'progression'),
      ($1, $12, 'strength'),
      ($1, $13, 'strength'),
      ($1, $14, 'accessory'),
      ($1, $15, 'accessory'),
      ($1, $16, 'accessory')

    ON CONFLICT (skill_id, exercise_id, purpose) DO NOTHING
  `,
    [
      skillId,
      exerciseMap["Wrist Conditioning"],
      exerciseMap["Scapular Push-ups"],
      exerciseMap["Planche Lean"],
      exerciseMap["Straight Arm Frog Stand"],
      exerciseMap["Tuck Planche Hold"],
      exerciseMap["Advanced Tuck Planche Hold"],
      exerciseMap["Pseudo Planche Push-ups"],
      exerciseMap["Tuck Planche Push-ups"],
      exerciseMap["Straddle Planche Hold"],
      exerciseMap["Straddle Planche Push-ups"],
      exerciseMap["Full Planche Hold"],
      exerciseMap["Planche Push-ups"],
      exerciseMap["Elbow Lever"],
      exerciseMap["One Arm Elbow Lever"],
      exerciseMap["Maltese Progressions"],
    ],
  );

  console.log("Planche seeded.");
};
