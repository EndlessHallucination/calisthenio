const db = require("../config/db");

const getProfile = async () => {
  const profile = await db.query(`
    SELECT *
    FROM profile
    WHERE id=1
  `);

  if (!profile.rows[0]) {
    return null;
  }

  const equipment = await db.query(`
    SELECT e.*
    FROM equipment e
    JOIN profile_equipment pe
      ON e.id = pe.equipment_id
    WHERE pe.profile_id=1
  `);

  return {
    ...profile.rows[0],
    equipment: equipment.rows,
  };
};
const createProfile = async (data) => {
  const {
    experience,
    height_cm,
    weight_kg,
    age,
    days_per_week,
    session_duration_minutes,
    equipment = [],
  } = data;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const profileResult = await client.query(
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
      VALUES ($1,$2,$3,$4,$5,$6,$7)

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

    await client.query(`
      DELETE FROM profile_equipment
      WHERE profile_id = 1
    `);

    for (const equipmentId of equipment) {
      await client.query(
        `
        INSERT INTO profile_equipment
        (
          profile_id,
          equipment_id
        )
        VALUES ($1,$2)
        `,
        [1, equipmentId],
      );
    }

    await client.query("COMMIT");
    const equipmentResult = await client.query(`
    SELECT e.id,e.name
    FROM equipment e
    JOIN profile_equipment pe
      ON e.id = pe.equipment_id
    WHERE pe.profile_id = 1
`);

    return {
      ...profileResult.rows[0],
      equipment,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getProfile,
  createProfile,
};
