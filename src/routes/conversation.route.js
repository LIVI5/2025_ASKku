const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  sendMessage,
  getMyConversations,
  getConversationDetail,
} = require("../controllers/conversation.controller");

router.post("/message", auth, sendMessage);
router.get("/", auth, getMyConversations);
router.get("/:conversationID", auth, getConversationDetail);

module.exports = router;
