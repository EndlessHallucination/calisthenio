const db = require("../config/db");

const getEquipment = async () => {
  await client.query("COMMIT");

  const result = await client.query(`
    SELECT 
        e.id,
        e.name
    FROM equipment e
    JOIN profile_equipment pe
        ON e.id = pe.equipment_id
    WHERE pe.profile_id = 1
`);

  return result.rows;
};

const updateEquipment = async (equipmentIds = []) => {
  const client = await db.connect();

  if (!Array.isArray(equipmentIds)) {
    throw new Error("equipmentIds must be an array");
  }

  try {
    await client.query("BEGIN");

    await client.query(`
            DELETE FROM profile_equipment
            WHERE profile_id = 1
        `);

    for (const equipmentId of equipmentIds) {
      await client.query(
        `
                INSERT INTO profile_equipment
                (
                    profile_id,
                    equipment_id
                )
                VALUES
                ($1,$2)
                `,
        [1, equipmentId],
      );
    }

    await client.query("COMMIT");

    return getEquipment();
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getAllEquipment = async () => {
  const result = await db.query(`
    SELECT *
    FROM equipment
    ORDER BY id
`);

  return result.rows;
};

module.exports = {
  getEquipment,
  updateEquipment,
  getAllEquipment,
};
