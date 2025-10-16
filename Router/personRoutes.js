// routes/passedOneRoutes.js
const express = require("express");
const router = express.Router();
const { createPerson } = require("../controllers/PersonController");

router.post("/create", createPerson);

module.exports = router;
