import express from "express";
const router = express.Router();
import {
  createChat,
  deleteChat,
  updateTextChat,
  getAllChatsList,
  getChatMessages,
  updateVoiceMessage,
} from "../controllers/chatController.js";
import { verifyToken } from "../Middleware/JWT.js";

router.use(verifyToken);
router.post("/create", createChat);
router.get("/getMessages/:chatId", getChatMessages);
router.put("/updateChatMessage/:chatId", updateTextChat);
router.post("/updateChatVoice/:chatId", updateVoiceMessage);
router.delete("/delete/:chatId", deleteChat);
router.get("/getAllChatsList", getAllChatsList);

export default router;
