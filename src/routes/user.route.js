const express = require("express");
const router = express.Router();

const path = require("path");
const controller = require(path.join(__dirname, "../controllers/user.controller"));

const { register, login, me } = controller;


const authMiddleware = require("../middleware/auth.middleware");

// 회원가입
router.post("/register", register);

// 로그인
router.post("/login", login);

// 내 정보 조회 (로그인 필요)
router.get("/me", authMiddleware, me);

module.exports = router;
