const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "토큰 없음" });
  }

  const token = auth.split(" ")[1].trim();

  try {
    // JWT 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // JWT payload에서 userID 읽기 (db 스키마 기준)
    const user = await User.findByPk(decoded.userID, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 사용자",
      });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error("JWT ERROR:", err.message);
    res.status(401).json({ success: false, message: "인증 실패" });
  }
}

module.exports = authMiddleware;
