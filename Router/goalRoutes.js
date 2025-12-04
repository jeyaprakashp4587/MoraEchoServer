import express from "express";
import { createGoal, getGoals, completeTodo, deleteGoal, deleteTodo, addTodoToGoal } from "../controllers/goalController.js";
import { verifyToken } from "../Middleware/JWT.js";

const router = express.Router();

router.post("/create", verifyToken, createGoal);
router.get("/", verifyToken, getGoals);
router.post("/complete-todo", verifyToken, completeTodo);
router.delete("/delete", verifyToken, deleteGoal);
router.delete("/delete-todo", verifyToken, deleteTodo);
router.post("/add-todo", verifyToken, addTodoToGoal);

export default router;

