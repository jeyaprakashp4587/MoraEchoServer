const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/authController");
const { cacheUserData } = require("../Middleware/cacheMiddleware");

// POST /api/auth/register
router.use(cacheUserData);
router.post("/register", registerUser);

module.exports = router;
