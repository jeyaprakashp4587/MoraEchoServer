import Chat from "../models/Chat.js";
import { deleteCache, getCache, setCache } from "../Redis/redis.js";
import { getGPTResponse } from "../helpers/gpt.js";
import { VoiceChatWithPerson } from "../helpers/voiceChat.js";
// create new chat
export const createChat = async (req, res) => {
  try {
    const { personId, chatType } = req.body;

    const newChat = await Chat.create({
      userId: req.userId,
      personId,
      ChatType: chatType,
    });

    res.status(200).json({ message: "Chat created", newChat: newChat?._id });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: "Error creating chat" });
  }
};
// get all chats for user
export const getAllChatsList = async (req, res) => {
  try {
    const cachedChats = await getCache(`chats${req.userId}`);
    // if (cachedChats) {
    //   return res.status(200).json({
    //     message: "Chats fetched successfully",
    //     chats: cachedChats,
    //   });
    // }
    const chats = await Chat.find({ userId: req.userId }, { chat: 0 })
      .populate({
        path: "personId",
        select: "name imageUrl",
      })
      .sort({ updatedAt: -1 });
    // console.log(chats);
    await setCache(`chats${req.userId}`, chats, 2000);
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
    const updateVoiceChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { chat: userVoice } },
      { new: true }
    );

    const cachedPersonData = await getCache(`cache${chatId}of${req.userId}`);
    let person = {};
    if (cachedPersonData) {
      // console.log("redis cached", cachedPersonData);

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
// update text chat
export const updateTextChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { newMessage } = req.body;
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
          chat: {
            sender: userMessage?.sender,
            message: userMessage?.message,
            audioUrl: userMessage?.audioUrl,
          },
        },
      },
      { new: true }
    );
    // getPsersonData by user chat
    const cachedPersonData = await getCache(`cache${chatId}of${req.userId}`);
    let person = {};
    if (cachedPersonData) {
      person = {
        name: cachedPersonData.person.name || "Unknown",
        relation: cachedPersonData.person?.relation || "someone close",
        behavior: cachedPersonData.person?.behavior || "kind, warm, and caring",
        language: cachedPersonData.person?.language || "English",
        RelUserName: req.user.name || "User",
        MemoryStory: cachedPersonData.person?.MemoryStory || null,
      };
    } else {
      const personData = await Chat.findById(chatId).populate({
        path: "personId",
        select: "name relation behavior language voiceId MemoryStory",
      });

      person = {
        name: personData.personId?.name || "Unknown",
        relation: personData.personId?.relation || "someone close",
        behavior: personData.personId?.behavior || "kind, warm, and caring",
        language: personData.personId?.language || "English",
        RelUserName: req.user.name || "User",
        MemoryStory: personData.personId?.MemoryStory || null,
      };
      await setCache(`cache${chatId}of${req.userId}`, { person: person }, 2000);
    }
    const lastMessages = updatedChat.chat.slice(-10).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.message,
    }));

    // Generate GPT response

    const aiResponse = await getGPTResponse(
      updatedChat.ChatType,
      person,
      newMessage,
      lastMessages
    );
    // Save GPT message
    const aiMessage = {
      sender: "Person",
      message: aiResponse,
      audioUrl: null,
    };
    await Chat.findByIdAndUpdate(
      chatId,
      { updatedAt: Date.now() },
      { new: true }
    );
    updatedChat?.chat.push(aiMessage);
    await updatedChat?.save();
    res.status(201).json({
      message: "Chat updated",
      newChat: updatedChat?.chat[updatedChat.chat.length - 1],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating chat" });
  }
};
// get chat messages
import mongoose from "mongoose";

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 10, firstImp = true } = req.query;
    const skip = (page - 1) * parseInt(limit);
    if (firstImp) {
      const chatDoc = await Chat.findOne({
        _id: chatId,
        userId: req.userId,
      }).populate("personId", "name imageUrl");

      if (!chatDoc) {
        return res.status(404).json({ error: "Chat not found" });
      }
      if (!chatDoc.chat || chatDoc.chat.length === 0) {
        return res.status(200).json({
          message: "Chat fetched successfully",
          messages: [],
          chatUserData: {
            name: chatDoc.personId.name,
            imageUrl: chatDoc.personId.imageUrl,
          },
          hasMore: false,
        });
      }
    }

    const result = await Chat.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(chatId),
          userId: new mongoose.Types.ObjectId(req.userId),
        },
      },
      { $unwind: "$chat" },
      { $sort: { "chat.createdAt": -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "persons",
          localField: "personId",
          foreignField: "_id",
          as: "person",
        },
      },
      { $unwind: "$person" },
      {
        $project: {
          message: "$chat",
          person: {
            name: "$person.name",
            imageUrl: "$person.imageUrl",
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(200).json({
        message: "Messages fetched successfully",
        messages: [],
        chatUserData: null,
        hasMore: false,
      });
    }
    const messages = [...result.map((r) => r.message)].reverse();
    const chatUserData = result[0].person;
    const hasMore = result.length === parseInt(limit);
    res.status(200).json({
      message: "Messages fetched successfully",
      messages,
      chatUserData,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: "Error fetching chat messages" });
  }
};

// delete chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    // console.log(chatId);
    await deleteCache(`cache${chatId}of${req.userId}`);
    await deleteCache(`chats${req.userId}`);
    res.json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting chat" });
  }
};
