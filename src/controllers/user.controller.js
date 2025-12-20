const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Timetable } = require("../models");

// ------------------ REGISTER ------------------
const register = async (req, res) => {
  try {
    const { email, password, name, department, grade, additional_info } = req.body;

    // 필수값 검증
    if (!email || !password || !grade) {
      return res.status(400).json({
        success: false,
        message: "email, password, grade는 필수값입니다.",
      });
    }

    // 이메일 중복 확인
    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "이미 가입된 이메일입니다.",
      });
    }

    // 비밀번호 해시
    const hash = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await User.create({
      email,
      password_hash: hash,
      name: name || null,
      department: department || null,
      grade, // 필수
      additional_info: additional_info || null,
    });

    // 사용자의 기본 시간표 생성
    await Timetable.create({ userID: user.userID });

    return res.status(201).json({
      success: true,
      message: "회원가입 완료",
      userID: user.userID,
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

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "identifier(email)와 password는 필수입니다.",
      });
    }

    // identifier = email
    const user = await User.findOne({
      where: { email: identifier },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    // 비밀번호 검증
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "비밀번호가 올바르지 않습니다.",
      });
    }

    // JWT 발급
    const token = jwt.sign(
      { userID: user.userID },
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


// ------------------ 추가 정보 저장 ------------------
const updateAdditionalInfo = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { additionalInfo } = req.body;

    if (additionalInfo === undefined) {
      return res.status(400).json({
        success: false,
        message: "추가 정보(additionalInfo)가 필요합니다.",
      });
    }

    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    await user.update({ additional_info: additionalInfo });

    return res.json({
      success: true,
      message: "추가 정보가 저장되었습니다.",
      additional_info: user.additional_info,
    });

  } catch (err) {
    console.error("Update Additional Info Error:", err);
    return res.status(500).json({ success: false, message: "정보 저장 실패" });
  }
};


// ------------------ 내 정보 조회 ------------------
const getMyInfo = async (req, res) => {
  try {
    const userID = req.user.userID;

    const user = await User.findByPk(userID, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    return res.json({
      success: true,
      user,
    });

  } catch (err) {
    console.error("Get My Info Error:", err);
    return res.status(500).json({ success: false, message: "정보 조회 실패" });
  }
};


module.exports = {
  register,
  login,
  updateAdditionalInfo,
  getMyInfo,
};
