// const Chat = require("../models/Chat.js");
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { deleteCache, getCache, setCache } from "../Redis/redis.js";
import { getGPTResponse } from "../utils/gpt.js";
import { VoiceChatWithPerson } from "../utils/voiceChat.js";
// create new chat
export const createChat = async (req, res) => {
  try {
    const { personId, chatType } = req.body;

    const newChat = await Chat.create({
      userId: req.userId,
      personId,
      ChatType: chatType,
    });

    res.status(200).json({ message: "Chat created", newChat });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: "Error creating chat" });
  }
};

// get chats by user and person id
export const getChatsByUserAndPerson = async (req, res) => {
  try {
    const { personId } = req.params;
    const chats = await Chat.find({ userId: req.userId, personId });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching chats", error });
  }
};
// get all chats for user
export const getAllChatsList = async (req, res) => {
  try {
    // Find all chats for this user and populate person details
    const chats = await Chat.find({ userId: req.userId })
      .populate({
        path: "personId",
        select: "name relation behavior language imageUrl voiceId",
      })
      .sort({ updatedAt: -1 }); // Sort by most recent first

    res.status(200).json({
      message: "Chats fetched successfully",
      chats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Error fetching chats" });
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
    // getPsersonData by user chat
    const cachedPersonData = await getCache(`cache${chatId}of${req.userId}`);
    let person = {};
    if (cachedPersonData) {
      console.log("redis cached", cachedPersonData);

      person = {
        name: cachedPersonData.personId?.name || "Unknown",
        relation: cachedPersonData.personId?.relation || "someone close",
        behavior:
          cachedPersonData.personId?.behavior || "kind, warm, and caring",
        language: cachedPersonData.personId?.language || "English",
        RelUserName: req.user.name || "User",
      };
    } else {
      const personData = await Chat.findById(chatId).populate({
        path: "personId",
        select: "name relation behavior language voiceId",
      });

      person = {
        name: personData.personId?.name || "Unknown",
        relation: personData.personId?.relation || "someone close",
        behavior: personData.personId?.behavior || "kind, warm, and caring",
        language: personData.personId?.language || "English",
        RelUserName: req.user.name || "User",
        // voiceId: personData.personId?.voiceId,
      };
      await setCache(`cache${chatId}of${req.userId}`, person, 2000);
    }
    // create person voice
    const personVoiceUrl = await VoiceChatWithPerson(
      updateVoiceChat.ChatType,
      newVoice,
      person
    ).catch((err) => {
      return res.status(503).json({ error: "error on generate voice" });
    });
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
    return res.status(500).json({ error: "Server error" });
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
      {
        $push: {
          chat: userMessage,
        },
      },
      { new: true }
    );
    // await deleteCache(`cache${chatId}of${req.userId}`);
    // getPsersonData by user chat
    const cachedPersonData = await getCache(`cache${chatId}of${req.userId}`);
    let person = {};
    if (cachedPersonData) {
      // console.log();
      console.log("Redis cached", cachedPersonData);

      person = {
        name: cachedPersonData.person.name || "Unknown",
        relation: cachedPersonData.person?.relation || "someone close",
        behavior: cachedPersonData.person?.behavior || "kind, warm, and caring",
        language: cachedPersonData.person?.language || "English",
        RelUserName: req.user.name || "User",
      };
    } else {
      const personData = await Chat.findById(chatId).populate({
        path: "personId",
        select: "name relation behavior language voiceId",
      });

      person = {
        name: personData.personId?.name || "Unknown",
        relation: personData.personId?.relation || "someone close",
        behavior: personData.personId?.behavior || "kind, warm, and caring",
        language: personData.personId?.language || "English",
        RelUserName: req.user.name || "User",
        // voiceId: personData.personId?.voiceId,
      };
      await setCache(`cache${chatId}of${req.userId}`, { person: person }, 2000);
    }

    // Generate GPT response
    const aiResponse = await getGPTResponse(
      updatedChat.ChatType,
      person,
      newMessage
    );
    // console.log("ai Response", aiResponse);

    // Save GPT message
    const aiMessage = {
      sender: "Person",
      message: aiResponse,
      audioUrl: null,
    };
    updatedChat?.chat.push(aiMessage);
    await updatedChat?.save();

    res.status(201).json({ message: "Chat updated", chat: updatedChat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating chat" });
  }
};

// Get chat messages by chatId with pagination
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.userId, // Ensure user owns this chat
    }).populate({
      path: "personId",
      select: "name relation behavior language imageUrl voiceId",
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const totalMessages = chat.chat.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const startIndex = Math.max(0, totalMessages - pageNum * limitNum);
    const endIndex = totalMessages - (pageNum - 1) * limitNum;

    // Get the slice of messages (older messages for higher page numbers)
    const messages = chat.chat.slice(startIndex, endIndex);

    // Has more if there are older messages (lower index messages exist)
    const hasMore = startIndex > 0;

    res.status(200).json({
      message: "Messages fetched successfully",
      messages,
      hasMore,
      currentPage: pageNum,
      totalMessages,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: "Error fetching chat messages" });
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
    res.status(500).json({ error: "Error deleting chat" });
  }
};
