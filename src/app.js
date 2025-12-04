// app.js �Ǵ� server.js

const express = require("express");
const app = express();

// �̵���� ����
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== ����� import ==========
const timetableRoutes = require("./routes/timetable.route");
const bookmarkRoutes = require("./routes/bookmark.route");
const ragRoutes = require("./routes/rag.route");
const userRoutes = require("./routes/user.route");
const noticeRoutes = require("./routes/notice.route");
const scheduleRoutes = require("./routes/schedule.route");  

// ========== ����� ��� ==========
app.use("/api/timetables", timetableRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/schedule", scheduleRoutes);

// ========== ���� �ڵ鸵 ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "���� ������ �߻��߽��ϴ�.",
  });
});

// ========== ���� ���� ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;