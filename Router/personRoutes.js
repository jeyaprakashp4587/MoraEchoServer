// routes/passedOneRoutes.js
import express from "express";
const router = express.Router();
import { createPerson } from "../controllers/PersonController.js";
import { verifyToken } from "../Middleware/JWT.js";

router.post("/create", verifyToken, createPerson);

export default router;
