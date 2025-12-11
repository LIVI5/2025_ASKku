const fs = require("fs");
const path = require("path");

// latest_notices.json 파일 경로
const LATEST_NOTICES_PATH = path.join(__dirname, "../rag/latest_notices.json");

// ==================== 최신 공지사항 조회 ====================
const getLatestNotices = async (req, res) => {
  try {
    // 파일 존재 여부 확인
    if (!fs.existsSync(LATEST_NOTICES_PATH)) {
      return res.status(404).json({
        success: false,
        message: "최신 공지사항 데이터를 찾을 수 없습니다. 크롤링을 먼저 실행해주세요.",
      });
    }

    // 파일 읽기
    const data = fs.readFileSync(LATEST_NOTICES_PATH, "utf-8");
    const latestNotices = JSON.parse(data);

    // 응답
    return res.json({
      success: true,
      notices: latestNotices,
    });

  } catch (err) {
    console.error("Get Latest Notices Error:", err);

    // JSON 파싱 오류
    if (err instanceof SyntaxError) {
      return res.status(500).json({
        success: false,
        message: "공지사항 데이터 형식이 올바르지 않습니다.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "공지사항 조회 실패",
    });
  }
};

module.exports = {
  getLatestNotices,
};