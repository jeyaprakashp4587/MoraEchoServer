import express from "express";
const router = express.Router();
import {
  createChat,
  getChatsByUserAndPerson,
  deleteChat,
  updateTextChat,
  getAllChatsList,
  getChatMessages,
} from "../controllers/chatController.js";
import { verifyToken } from "../Middleware/JWT.js";

router.use(verifyToken);
router.post("/create", createChat);
router.get("/getChats/:personId", getChatsByUserAndPerson);
router.get("/getMessages/:chatId", getChatMessages);
router.put("/update/:chatId", updateTextChat);
router.delete("/delete/:chatId", deleteChat);
router.get("/getAllChatsList", getAllChatsList);

export default router;
