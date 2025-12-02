// app.js 또는 server.js

const express = require("express");
const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== 라우터 import ==========
const timetableRoutes = require("./routes/timetable.routes");
const bookmarkRoutes = require("./routes/bookmark.routes");
const ragRoutes = require("./routes/rag.routes");
const userRoutes = require("./routes/user.routes");
const noticeRoutes = require("./routes/notice.routes");

// ========== 라우터 등록 ==========
app.use("/api/timetables", timetableRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notices", noticeRoutes);

// ========== 에러 핸들링 ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "서버 오류가 발생했습니다.",
  });
});

// ========== 서버 실행 ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;