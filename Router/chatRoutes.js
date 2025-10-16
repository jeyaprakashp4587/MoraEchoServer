const express = require("express");
const router = express.Router();
const {
  createChat,
  getChatsByUserAndPerson,
  updateChat,
  deleteChat,
} = require("../controllers/chatController");
const { cacheUserData } = require("../Middleware/cacheMiddleware");
router.use(cacheUserData);
router.post("/create", createChat);
router.get("/chats/:userId/:passedOneId", getChatsByUserAndPerson);
router.put("/update/:chatId", updateChat);
router.delete("/delete/:chatId", deleteChat);

module.exports = router;
