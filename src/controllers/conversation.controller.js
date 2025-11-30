const { Conversation, Message, User, Timetable, TimetableItem } = require("../models");
const { queryRag } = require("../utils/ragClient");

// ---------------- CREATE / SEND MESSAGE ----------------
const sendMessage = async (req, res) => {
  try {
    const userID = req.user.userID;
    let { conversationID, message } = req.body;

    if (!message) return res.status(400).json({ success: false, message: "메시지가 없습니다" });

    // 1) conversation auto create if missing
    if (!conversationID) {
      const newConversation = await Conversation.create({
        userID,
        title: message.slice(0, 20),
      });
      conversationID = newConversation.convID;
    }

    // 2) Save user message
    await Message.create({ convID: conversationID, userID, role: "user", message });

    // 3) Build RAG context
    const userInfo = await User.findByPk(userID, { attributes: ["name", "email", "department"] });
    const timetable = await Timetable.findAll({
      where: { userID },
      include: [{ model: TimetableItem }],
    });

    const historyMessages = await Message.findAll({
      where: { convID: conversationID },
      order: [["timestamp", "ASC"]],
    });

    const formattedHistory = historyMessages.map(m => ({
      role: m.role,
      content: m.message,
    }));

    // 4) Query Python RAG engine
    const aiReply = await queryRag({
        message,
        history: formattedHistory,
        user_info: userInfo,
        timetable
    });

    // 5) Store assistant reply
    await Message.create({ convID: conversationID, role: "assistant", message: aiReply });

    return res.json({ success: true, conversationID, reply: aiReply });

  } catch (err) {
    console.error("Conversation Error:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// ---------------- GET USER CONVERSATION LIST ----------------
const getMyConversations = async (req, res) => {
  const userID = req.user.userID;
  const list = await Conversation.findAll({ where: { userID }, order: [["updatedAt", "DESC"]] });
  res.json({ success: true, data: list });
};

// ---------------- GET MESSAGES IN CONVERSATION ----------------
const getConversationDetail = async (req, res) => {
  const { conversationID } = req.params;
  const messages = await Message.findAll({
    where: { convID: conversationID },
    order: [["timestamp", "ASC"]],
  });
  res.json({ success: true, data: messages });
};

module.exports = { sendMessage, getMyConversations, getConversationDetail };
