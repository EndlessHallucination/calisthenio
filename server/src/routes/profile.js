const express = require("express");

const router = express.Router();

const { getProfile, createProfile } = require("../services/profileService");

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



module.exports = router;
