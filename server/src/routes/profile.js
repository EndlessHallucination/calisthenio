const express = require("express");

const router = express.Router();

const { getProfile, createProfile } = require("../services/profileService");

const {
  getEquipment,
  updateEquipment,
} = require("../services/equipmentService");

router.get("/", async (req, res) => {
  try {
    const result = await getProfile();
    if (!result) return res.status(404).json({ error: "No profile found" });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const profile = await createProfile(req.body);

    res.status(201).json(profile);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create profile",
      error: error.message,
    });
  }
});

router.get("/equipment", async (req, res) => {
  try {
    const equipment = await getEquipment();

    res.json(equipment);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.put("/equipment", async (req, res) => {
  try {
    const { equipmentIds } = req.body;

    const result = await updateEquipment(equipmentIds);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
