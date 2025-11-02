import express from "express";
const router = express.Router();
import {
  getUser,
  login,
  refresh,
  registerUser,
} from "../controllers/authController.js";
import { verifyToken } from "../Middleware/JWT.js";

router.post("/register", registerUser);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/getUser/:userId", verifyToken, getUser);

export default router;
