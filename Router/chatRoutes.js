const express = require("express");
const router = express.Router();
const {
  createChat,
  getChatsByUser,
  updateChat,
  deleteChat,
} = require("../controllers/chatController");

router.post("/create", createChat);
router.get("/chats/:userId/:passedOneId", getChatsByUserAndPassedOne);
router.put("/update/:chatId", updateChat);
router.delete("/delete/:chatId", deleteChat);

module.exports = router;
