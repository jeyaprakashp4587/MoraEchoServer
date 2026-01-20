import express from "express";
const router = express.Router();

import { verifyToken } from "../Middleware/JWT.js";
import { getPlans } from "../controllers/planController.js";

router.get("/getPlans", verifyToken, getPlans);
export default router;
