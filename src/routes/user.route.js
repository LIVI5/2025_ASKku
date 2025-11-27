const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  register,
  login,
  updateAdditionalInfo,
  getMyInfo,
} = require("../controllers/user.controller");


// 회원가입
router.post("/register", register);
// 로그인
router.post("/login", login);
// 내 정보 조회
router.get("/me", auth, getMyInfo);
// 추가 정보 업데이트
router.put("/additional-info", auth, updateAdditionalInfo);

module.exports = router;