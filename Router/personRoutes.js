// routes/passedOneRoutes.js
import express from "express";
const router = express.Router();
import { createPerson } from "../controllers/PersonController.js";

router.post("/create", createPerson);

export default router;
