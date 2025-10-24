import express from "express";
const router = express.Router();
import { login, refresh, registerUser } from "../controllers/authController.js";

// POST /api/auth/register
// router.use(cacheUserData);
router.post("/register", registerUser);
router.post("/login", login);
router.post("/refresh", refresh);

export default router;
