import express from "express";
const router = express.Router();
import { registerUser } from "../controllers/authController.js";

// POST /api/auth/register
// router.use(cacheUserData);
router.post("/register", registerUser);

export default router;
