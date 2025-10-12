const express = require("express");
const router = express.Router();
const voiceChatController = require("../controllers/voiceChatController");

router.post("/voiceChat", voiceChatController);

module.exports = router;
