import express from "express";
const router = express.Router();
import {
  createChat,
  getChatsByUserAndPerson,
  deleteChat,
  updateTextChat,
} from "../controllers/chatController.js";
import { cacheUserData } from "../Middleware/cacheMiddleware.js";
router.use(cacheUserData);
router.post("/create", createChat);
router.get("/chats/:userId/:passedOneId", getChatsByUserAndPerson);
router.put("/update/:chatId", updateTextChat);
router.delete("/delete/:chatId", deleteChat);

export default router;
