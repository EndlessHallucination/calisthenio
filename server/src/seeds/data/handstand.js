module.exports = async function seedHandstand(client) {
  await client.query(
    `
    INSERT INTO skills (name, category, difficulty, description)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (name) DO NOTHING
  `,
    [
      "Handstand",
      "pushing",
      "beginner",
      "A fundamental inverted balance skill performed on the hands. Develops shoulder strength, body awareness, balance, and overhead stability.",
    ],
  );

  const skillResult = await client.query(
    `SELECT id FROM skills WHERE name = $1`,
    ["Handstand"],
  );
  const skillId = skillResult.rows[0].id;

  await client.query(
    `
    INSERT INTO milestones (skill_id, name, sequence, hold_time_seconds, description, notes)
    VALUES
      ($1, 'Wall Handstand', 1, 30,
       'Hold a chest-to-wall handstand with a straight body line.',
       'Push tall through the shoulders and maintain a hollow body.'),

      ($1, 'Handstand', 2, 20,
       'Freestanding handstand with full body control.',
       'Focus on balance using fingertips rather than excessive shoulder movement.'),

      ($1, 'Tuck Handstand', 3, 15,
       'Balance in a tucked handstand with knees close to the chest.',
       'Helps improve balance and compression.'),

      ($1, 'Straddle Handstand', 4, 15,
       'Hold a freestanding handstand with legs straddled.',
       'A wider straddle makes balancing easier while building control.'),

      ($1, 'One Arm Handstand', 5, 5,
       'Balance on a single arm with complete body control.',
       'Requires excellent balance, shoulder strength, and body alignment.')
    ON CONFLICT (skill_id, sequence) DO NOTHING
  `,
    [skillId],
  );

  await client.query(`
    INSERT INTO exercises (name, category, equipment, difficulty, description)
    VALUES
      ('Wall Plank', 'pushing', 'wall', 'beginner',
       'Face the wall in a plank position with feet against the wall to build overhead stability.'),

      ('Wall Headstand', 'pushing', 'wall', 'beginner',
       'Hold a headstand against the wall to develop inversion confidence.'),

      ('Wall Handstand Hold', 'pushing', 'wall', 'beginner',
       'Chest-to-wall handstand focusing on straight body alignment.'),

      ('Freestanding Handstand Hold', 'pushing', 'bodyweight', 'intermediate',
       'Balance in a freestanding handstand using fingertip control.'),

      ('Tuck Handstand Hold', 'pushing', 'bodyweight', 'intermediate',
       'Perform a tucked handstand emphasizing balance and compression.'),

      ('Straddle Handstand Hold', 'pushing', 'bodyweight', 'advanced',
       'Balance with legs straddled while maintaining a straight torso.'),

      ('One Arm Handstand Hold', 'pushing', 'bodyweight', 'elite',
       'Balance on one hand while maintaining body tension.'),

      ('Wall Handstand Push-up Negative', 'pushing', 'wall', 'intermediate',
       'Lower slowly from a wall handstand toward the head with full control.'),

      ('Wall Handstand Push-up', 'pushing', 'wall', 'intermediate',
       'Perform full handstand push-ups against a wall.'),

      ('Headstand Push-up', 'pushing', 'bodyweight', 'intermediate',
       'Press from the headstand position until the elbows are fully extended.'),

      ('Handstand Push-up', 'pushing', 'bodyweight', 'advanced',
       'Perform a strict freestanding handstand push-up.'),

      ('Shoulder Stand', 'pushing', 'bodyweight', 'beginner',
       'Hold a shoulder stand to develop inversion awareness and compression.'),

      ('Wall Shoulder Taps', 'pushing', 'wall', 'intermediate',
       'Alternate lifting one hand from a wall handstand to improve balance.'),

      ('Pike Push-up', 'pushing', 'bodyweight', 'beginner',
       'A bodyweight pressing exercise developing overhead pushing strength.'),

      ('Hollow Body Hold', 'core', 'bodyweight', 'beginner',
       'Hold a hollow body position while keeping the lower back pressed into the floor.'),

      ('Wall Walk', 'pushing', 'wall', 'beginner',
       'Walk the feet up a wall into a chest-to-wall handstand.')
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
      ($1, $10, 'strength'),
      ($1, $11, 'strength'),
      ($1, $12, 'accessory'),
      ($1, $13, 'accessory'),
      ($1, $14, 'strength'),
      ($1, $15, 'accessory'),
      ($1, $16, 'warmup'),
      ($1, $17, 'warmup')
    ON CONFLICT (skill_id, exercise_id, purpose) DO NOTHING
  `,
    [
      skillId,
      exerciseMap["Wall Plank"],
      exerciseMap["Wall Headstand"],
      exerciseMap["Wall Handstand Hold"],
      exerciseMap["Freestanding Handstand Hold"],
      exerciseMap["Tuck Handstand Hold"],
      exerciseMap["Straddle Handstand Hold"],
      exerciseMap["One Arm Handstand Hold"],
      exerciseMap["Wall Handstand Push-up Negative"],
      exerciseMap["Wall Handstand Push-up"],
      exerciseMap["Headstand Push-up"],
      exerciseMap["Handstand Push-up"],
      exerciseMap["Shoulder Stand"],
      exerciseMap["Wall Shoulder Taps"],
      exerciseMap["Pike Push-up"],
      exerciseMap["Hollow Body Hold"],
      exerciseMap["Wall Walk"],
    ],
  );

  console.log("Handstand seeded.");
};
