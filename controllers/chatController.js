const Chat = require("../models/Chat");

// 🟢 Create a new chat (first message)
exports.createChat = async (req, res) => {
  try {
    const { userId, passedOneId, chat } = req.body; // chat = [{sender, message, audioUrl?}]

    const newChat = await Chat.create({
      userId,
      passedOneId,
      chat,
    });

    res.status(201).json({ message: "Chat created", chat: newChat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating chat" });
  }
};

// 🟢 Get all chats by userId and passedOneId
exports.getChatsByUserAndPassedOne = async (req, res) => {
  try {
    const { userId, passedOneId } = req.params;
    const chats = await Chat.find({ userId, passedOneId });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error });
  }
};

// 🟢 Update chat (add new message)
exports.updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { newMessage } = req.body; // { sender, message, audioUrl }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { chat: newMessage } },
      { new: true }
    );

    res.json({ message: "Chat updated", chat: updatedChat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating chat" });
  }
};

// 🟢 Delete chat
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    res.json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting chat" });
  }
};
