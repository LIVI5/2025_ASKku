const { conversations: Conversation, messages: Message } = require("../models");

// 대화 생성
const startConversation = async (req, res) => {
  try {
    const title = req.body.title?.trim() || "새로운 대화";

    const conversation = await Conversation.create({
      user_id: req.user.user_id,
      title,
    });

    return res.json({ success: true, conversation });

  } catch (err) {
    console.error("Conversation Creation Error:", err);
    return res.status(500).json({
      success: false,
      message: "대화 생성 실패",
    });
  }
};

// 메시지 저장
const sendMessage = async (req, res) => {
  try {
    const { conv_id, role, content } = req.body;

    if (!conv_id || !content) {
      return res.status(400).json({
        success: false,
        message: "conv_id와 content는 필수 값입니다.",
      });
    }

    const message = await Message.create({
      conv_id,
      role: role || "user",
      content,
    });

    return res.json({ success: true, message });

  } catch (err) {
    console.error("Message Creation Error:", err);
    return res.status(500).json({
      success: false,
      message: "메시지 저장 실패",
    });
  }
};

// 특정 대화의 모든 메시지 가져오기
const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const messages = await Message.findAll({
      where: { conv_id: id },
      order: [["msg_id", "ASC"]],
    });

    return res.json({ success: true, messages });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "메시지 조회 실패",
    });
  }
};

// 내 모든 대화 목록 조회
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: { user_id: req.user.user_id },
      order: [["conv_id", "DESC"]],
    });

    return res.json({ success: true, conversations });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "대화 목록 조회 실패",
    });
  }
};

module.exports = {
  startConversation,
  sendMessage,
  getConversationMessages,
  getMyConversations,
};
