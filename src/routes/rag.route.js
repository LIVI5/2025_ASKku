const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const { askRAG, translate } = require("../controllers/rag.controller");

// RAG 질문 (인증 필요)
router.post("/ask", auth, askRAG);

// 번역 (인증 불필요)
router.post("/translate", translate);

module.exports = router;