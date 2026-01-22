import express from "express";
const router = express.Router();

import { verifyToken } from "../Middleware/JWT.js";
import { getPlans, purchaseSubs } from "../controllers/planController.js";

router.get("/getPlans", verifyToken, getPlans);
router.post("/purchaseSubs", verifyToken, purchaseSubs);
export default router;
