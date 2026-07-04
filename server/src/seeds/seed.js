const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const pool = require("../config/db");

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO skills (name, category, difficulty, description)
   VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)
   ON CONFLICT (name) DO NOTHING`,
      [
        "Front Lever",
        "pulling",
        "intermediate",
        "Static pulling skill where the body is held horizontal beneath the bar.",
        "Handstand",
        "handstand",
        "advanced",
        "Balance skill performed upside down on the hands.",
      ],
    );

    const skillsResult = await client.query("SELECT id, name FROM skills");
    const skillMap = {};
    skillsResult.rows.forEach((s) => (skillMap[s.name] = s.id));

    await client.query(
      `
    INSERT INTO milestones
    (skill_id, name, sequence, hold_time_seconds)
    VALUES
        -- Front Lever
        ($1, 'Tuck Front Lever', 1, 10),
        ($1, 'Advanced Tuck Front Lever', 2, 10),
        ($1, 'One Leg Front Lever', 3, 8),
        ($1, 'Straddle Front Lever', 4, 5),
        ($1, 'Full Front Lever', 5, 5),

        -- Handstand
        ($2, 'Wall Handstand', 1, 30),
        ($2, 'Kick Up to Handstand', 2, 5),
        ($2, 'Freestanding Handstand', 3, 10),
        ($2, 'Consistent Freestanding Handstand', 4, 30)

    ON CONFLICT (skill_id, sequence) DO NOTHING

    `,
      [skillMap["Front Lever"], skillMap["Handstand"]],
    );

    await client.query(`
INSERT INTO exercises
(name, category, equipment, difficulty)
VALUES
('Scap Pull-ups', 'pulling', 'bar', 'beginner'),
('Tuck Front Lever Hold', 'pulling', 'bar', 'beginner'),
('Advanced Tuck Front Lever Hold', 'pulling', 'bar', 'intermediate'),
('One Leg Front Lever Hold', 'pulling', 'bar', 'intermediate'),
('Straddle Front Lever Hold', 'pulling', 'bar', 'advanced'),
('Front Lever Raises', 'pulling', 'bar', 'advanced'),
('Ice Cream Makers', 'pulling', 'bar', 'intermediate'),
('Hanging Knee Raises', 'pulling', 'bar', 'beginner'),
('Hollow Body Hold', 'core', 'bodyweight', 'beginner'),
('Dragon Flag Negatives', 'core', 'bar', 'intermediate')
ON CONFLICT (name) DO NOTHING
`);

    const exercisesResult = await client.query(
      "SELECT id, name FROM exercises",
    );

    const exerciseMap = {};

    for (const exercise of exercisesResult.rows) {
      exerciseMap[exercise.name] = exercise.id;
    }
    await client.query(
      `
INSERT INTO skill_exercises
(skill_id, exercise_id, purpose)
VALUES
($1, $2, 'warmup'),
($1, $3, 'progression'),
($1, $4, 'progression'),
($1, $5, 'progression'),
($1, $6, 'progression'),
($1, $7, 'strength'),
($1, $8, 'strength'),
($1, $9, 'warmup'),
($1, $10, 'accessory'),
($1, $11, 'accessory')
ON CONFLICT (skill_id, exercise_id, purpose) DO NOTHING
`,
      [
        skillMap["Front Lever"],
        exerciseMap["Scap Pull-ups"],
        exerciseMap["Tuck Front Lever Hold"],
        exerciseMap["Advanced Tuck Front Lever Hold"],
        exerciseMap["One Leg Front Lever Hold"],
        exerciseMap["Straddle Front Lever Hold"],
        exerciseMap["Front Lever Raises"],
        exerciseMap["Ice Cream Makers"],
        exerciseMap["Hanging Knee Raises"],
        exerciseMap["Hollow Body Hold"],
        exerciseMap["Dragon Flag Negatives"],
      ],
    );
    await client.query("COMMIT");
    console.log("Skills seeded successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
