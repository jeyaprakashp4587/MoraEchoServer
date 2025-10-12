// routes/passedOneRoutes.js
const express = require("express");
const router = express.Router();
const { createPassedOne } = require("../controllers/passedOneController");

router.post("/create", createPassedOne);

module.exports = router;
