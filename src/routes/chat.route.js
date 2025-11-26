const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  startConversation,
  sendMessage,
  getConversationMessages,
  getMyConversations
} = require("../controllers/chat.controller");

router.post("/start", auth, startConversation);
router.post("/message", auth, sendMessage);
router.get("/", auth, getMyConversations);
router.get("/:id", auth, getConversationMessages);

module.exports = router;
