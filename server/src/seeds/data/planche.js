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
      "An advanced straight-arm pushing skill where the body is held horizontally parallel to the ground supported only by the hands. Requires exceptional shoulder strength, wrist conditioning, and core tension.",
    ],
  );

  const skillResult = await client.query(
    `SELECT id FROM skills WHERE name = $1`,
    ["Planche"],
  );
  const skillId = skillResult.rows[0].id;

  await client.query(
    `
    INSERT INTO milestones (skill_id, name, sequence, hold_time_seconds, reps_required, description, notes)
    VALUES
      ($1, 'Planche Lean', 1, 30, NULL,
       'Hold a forward-leaning plank with straight arms and shoulders past the wrists.',
       'Build wrist tolerance and straight-arm pushing strength.'),

      ($1, 'Tuck Planche', 2, 10, NULL,
       'Hold a tuck planche with knees pulled to chest and arms straight.',
       'Focus on pushing the floor away and maintaining scapular protraction.'),

      ($1, 'Advanced Tuck Planche', 3, 10, NULL,
       'Hold an advanced tuck planche with hips more extended and body closer to horizontal.',
       'Increase shoulder lean and maintain strong scapular control.'),

      ($1, 'One Leg Planche', 4, 5, NULL,
       'Hold a planche with one leg extended and one leg tucked.',
       'Bridge progression between tuck variations and full planche.'),

      ($1, 'Straddle Planche', 5, 5, NULL,
       'Hold a straddle planche with both legs extended apart.',
       'Reduce leverage gradually before attempting full planche.'),

      ($1, 'Full Planche', 6, 5, NULL,
       'Hold a full planche with straight arms and body perfectly parallel to the ground.',
       'Main milestone. Requires maximum straight-arm pushing strength and full body tension.')

    ON CONFLICT (skill_id, sequence) DO NOTHING
  `,
    [skillId],
  );

  await client.query(`
    INSERT INTO exercises (name, category, equipment, difficulty, description)
    VALUES
      ('Wrist Conditioning', 'mobility', 'Bodyweight', 'beginner',
       'Prepare wrists for planche training through mobility and strengthening drills.'),

      ('Scapular Push-ups', 'pushing', 'Bodyweight', 'beginner',
       'Perform push-up movements focusing on scapular protraction and retraction without bending elbows.'),

      ('Planche Lean', 'pushing', 'Bodyweight', 'beginner',
       'Lean forward in a push-up position while maintaining straight arms to build shoulder strength.'),

      ('Straight Arm Frog Stand', 'pushing', 'Bodyweight', 'beginner',
       'Balance in a frog stand position with elbows locked and arms straight.'),

      ('Tuck Planche Hold', 'pushing', 'Bodyweight', 'intermediate',
       'Hold a tuck planche position with straight arms and protracted shoulders.'),

      ('Advanced Tuck Planche Hold', 'pushing', 'Bodyweight', 'intermediate',
       'Hold an advanced tuck planche with increased body extension.'),

      ('Pseudo Planche Push-ups', 'pushing', 'Bodyweight', 'intermediate',
       'Perform push-ups with shoulders leaning forward to mimic planche pushing mechanics.'),

      ('Tuck Planche Push-ups', 'pushing', 'Bodyweight', 'advanced',
       'Perform push-ups while maintaining a tuck planche position.'),

      ('Straddle Planche Hold', 'pushing', 'Bodyweight', 'advanced',
       'Hold a straddle planche with legs extended apart.'),

      ('Full Planche Hold', 'pushing', 'Bodyweight', 'elite',
       'Hold a full planche with straight arms and body perfectly horizontal.'),

      ('Elbow Lever', 'pushing', 'Bodyweight', 'intermediate',
       'Balance the body horizontally using the elbows as support points.')

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
      ($1, $3, 'warmup'),
      ($1, $4, 'progression'),
      ($1, $5, 'progression'),
      ($1, $6, 'progression'),
      ($1, $7, 'progression'),
      ($1, $8, 'strength'),
      ($1, $9, 'strength'),
      ($1, $10, 'progression'),
      ($1, $11, 'progression'),
      ($1, $12, 'accessory')
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
      exerciseMap["Full Planche Hold"],
      exerciseMap["Elbow Lever"],
    ],
  );

  console.log("Planche seeded.");
};
