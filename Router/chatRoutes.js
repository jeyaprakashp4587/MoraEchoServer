import express from "express";
const router = express.Router();
import {
  createChat,
  getChatsByUserAndPerson,
  deleteChat,
  updateTextChat,
} from "../controllers/chatController.js";
import { verifyToken } from "../Middleware/JWT.js";

router.use(verifyToken);
router.post("/create", createChat);
router.get("/chats/:passedOneId", getChatsByUserAndPerson);
router.put("/update/:chatId", updateTextChat);
router.delete("/delete/:chatId", deleteChat);

export default router;
