const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models"); // <-- 수정

// ------------------ REGISTER ------------------
const register = async (req, res) => {
  try {
    const { email, password, name, department } = req.body;

    // 이메일 중복 확인
    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "이미 가입된 이메일입니다.",
      });
    }

    // 비밀번호 해시화
    const hash = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await User.create({
      email,
      password_hash: hash,
      name,
      department,
    });

    return res.status(201).json({
      success: true,
      message: "회원가입 완료",
      userID: user.userID, // <-- 변경
    });

  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};


// ------------------ LOGIN ------------------
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // identifier = email
    const user = await User.findOne({
      where: {
        email: identifier,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    // 비밀번호 확인
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "비밀번호가 올바르지 않습니다.",
      });
    }

    // JWT 발급
    const token = jwt.sign(
      { userID: user.userID }, // <-- 변경
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "로그인 성공",
      token,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};


// ------------------ GET CURRENT USER ------------------
const me = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};


module.exports = { register, login, me };
