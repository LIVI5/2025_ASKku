const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users: User } = require("../models");

const register = async (req, res) => {
  try {
    const { student_no, email, password, name, department } = req.body;

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "이미 가입된 이메일입니다.",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      student_no,
      email,
      password_hash: hash,
      name,
      department,
    });

    return res.status(201).json({
      success: true,
      message: "회원가입 완료",
      user_id: user.user_id,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

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

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "비밀번호가 올바르지 않습니다.",
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "로그인 성공",
      token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

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
