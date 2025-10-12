const express = require("express");
const router = express.Router();
const { chatWithPassedOne } = require("../controllers/voiceChatController");

router.post("/voiceChat", chatWithPassedOne);

module.exports = router;
