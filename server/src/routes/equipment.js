const express = require("express");

const router = express.Router();

const { getAllEquipment } = require("../services/equipmentService");

router.get("/", async (req, res) => {
  try {
    const equipment = await getAllEquipment();

    res.json(equipment);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
