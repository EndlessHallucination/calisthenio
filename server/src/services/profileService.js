const db = require("../config/db");

const getProfile = async () => {
  const result = await db.query("SELECT * FROM profile");
  return result.rows[0];
};

const createProfile = async (data) => {
  const {
    experience,
    height_cm,
    weight_kg,
    age,
    days_per_week,
    session_duration_minutes,
  } = data;

  const result = await db.query(
    `
        INSERT INTO profile (
            id,
            experience,
            height_cm,
            weight_kg,
            age,
            days_per_week,
            session_duration_minutes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
            experience = EXCLUDED.experience,
            height_cm = EXCLUDED.height_cm,
            weight_kg = EXCLUDED.weight_kg,
            age = EXCLUDED.age,
            days_per_week = EXCLUDED.days_per_week,
            session_duration_minutes = EXCLUDED.session_duration_minutes,
            updated_at = NOW()
        RETURNING *
        `,
    [
      1,
      experience,
      height_cm,
      weight_kg,
      age,
      days_per_week,
      session_duration_minutes,
    ],
  );

  return result.rows[0];
};

module.exports = {
  getProfile,
  createProfile,
};
