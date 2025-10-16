// const Chat = require("../models/Chat.js");
import Chat from "../models/Chat.js";
import { getGPTResponse } from "../utils/gpt.js";
// 🟢 Create a new chat (first message)
export const createChat = async (req, res) => {
  try {
    const { userId, personId, chat } = req.body; // chat = [{sender, message, audioUrl?}]

    const newChat = await Chat.create({
      userId,
      personId,
      chat,
    });

    res.status(201).json({ message: "Chat created", chat: newChat });
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

// 🟢 Update chat (add new message)

export const updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { newMessage } = req.body; // { sender, message, audioUrl }

    // Save user message first
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { chat: newMessage } },
      { new: true }
    );

    // Use cached user data for GPT
    const person = {
      name: passedOne.name || "Unknown",
      relation: passedOne.relation || "someone close",
      behavior: passedOne.behavior || "kind, warm, and caring",
      language: passedOne.language || "English",
      RelUserName: req.cachedUser?.name || "User",
    };

    // Generate GPT response
    const aiResponse = await getGPTResponse(person);

    // Save GPT message
    const aiMessage = {
      sender: "AI",
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
