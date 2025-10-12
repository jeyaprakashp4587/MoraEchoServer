// routes/passedOneRoutes.js
const express = require("express");
const router = express.Router();
const { createPassedOne } = require("../controllers/passedOneControllers");

router.post("/create", createPassedOne);

module.exports = router;
