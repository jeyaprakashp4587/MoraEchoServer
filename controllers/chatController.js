// const Chat = require("../models/Chat.js");
import Chat from "../models/Chat.js";
import { getGPTResponse } from "../utils/gpt.js";
import { VoiceChatWithPerson } from "../utils/voiceChat.js";
// 🟢 Create a new chat (first message)
export const createChat = async (req, res) => {
  try {
    const { userId, personId } = req.body; // chat = [{sender, message, audioUrl?}]

    const newChat = await Chat.create({
      userId,
      personId,
    });

    res.status(201).json({ message: "Chat created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating chat" });
  }
};

// 🟢 Get all chats by userId and personId
export const getChatsByUserAndPerson = async (req, res) => {
  try {
    const { userId, personId } = req.params;
    const chats = await Chat.find({ userId, personId });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error });
  }
};
// Update voice chat
export const updateVoiceMessage = async (req, res) => {
  const { chatId } = req.params;
  const { newVoice } = req.body;
  const userVoice = {
    sender: "user",
    message: null,
    audioUrl: newVoice,
  };
  try {
    // first save user voice
    const updateVoiceChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { chat: userVoice } },
      { new: true }
    );
    const personData = await Chat.findById(chatId).populate(
      "Person",
      "name",
      "relation",
      "behavior",
      "language",
      "voiceId"
    );

    // Use cached user data for GPT
    const person = {
      name: personData.name || "Unknown",
      relation: personData.relation || "someone close",
      behavior: personData.behavior || "kind, warm, and caring",
      language: personData.language || "English",
      RelUserName: req.cachedUser?.name || "User",
      voiceId: personData?.voiceId,
    };
    // create person voice
    const personVoiceUrl = await VoiceChatWithPerson(newVoice, person).catch(
      (err) => {
        return res.status(503).json({ msg: "error on generate voice" });
      }
    );
    // save and return the person generated audio url
    if (personVoiceUrl.audioUrl) {
      await updateVoiceChat.chat.push({
        sender: "Person",
        message: null,
        audioUrl: personVoiceUrl.audioUrl,
      });
      await updateVoiceChat.save();
      return res.status(200).json({ voiceUrl: personVoiceUrl.audioUrl });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Server error" });
  }
};
// 🟢 Update Text chat (add new message)
export const updateTextChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { newMessage } = req.body; // {message, audioUrl }

    // Save user message first
    const userMessage = {
      sender: "user",
      message: newMessage,
      audioUrl: null,
    };
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { chat: userMessage } },
      { new: true }
    );
    const personData = await Chat.findById(chatId).populate(
      "Person",
      "name",
      "relation",
      "behavior",
      "language",
      "voiceId"
    );

    // Use cached user data for GPT
    const person = {
      name: personData?.name || "Unknown",
      relation: personData?.relation || "someone close",
      behavior: personData?.behavior || "kind, warm, and caring",
      language: personData?.language || "English",
      RelUserName: req.cachedUser?.name || "User",
      voiceId: personData?.voiceId,
    };

    // Generate GPT response
    const aiResponse = await getGPTResponse(person, newMessage);

    // Save GPT message
    const aiMessage = {
      sender: "Person",
      message: aiResponse,
      audioUrl: null,
    };

    updatedChat.chat.push(aiMessage);
    await updatedChat.save();

    res.json({ message: "Chat updated", chat: updatedChat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating chat" });
  }
};

// 🟢 Delete chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    res.json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting chat" });
  }
};
