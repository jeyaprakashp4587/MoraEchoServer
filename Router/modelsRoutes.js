import express from "express";
const router = express.Router();
import { getModels } from "../controllers/modelController.js";
import { verifyToken } from "../Middleware/JWT.js";
router.use(verifyToken);
router.get("/getModels", getModels);

export default router;
