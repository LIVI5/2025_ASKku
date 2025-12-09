const axios = require("axios");
const { User, Timetable, TimetableItem } = require("../models");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8001";

// ==================== RAG 질문 ====================
const askRAG = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { message, history, isFirstQuestion } = req.body;

    // 필수 필드 검증
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "질문 내용이 필요합니다.",
      });
    }

    // 1. 사용자 정보 가져오기
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    // 2. 시간표 정보 가져오기
    const timetables = await Timetable.findAll({
      where: { userID },
      include: [{ model: TimetableItem }],
    });

    // 시간표 데이터 포맷팅
    const timetableData = [];
    timetables.forEach((table) => {
      if (table.TimetableItems) {
        table.TimetableItems.forEach((item) => {
          timetableData.push({
            courseName: item.courseName,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            location: item.location,
          });
        });
      }
    });

    // 3. 사용자 정보 구성
    const userInfo = {
      name: user.name,
      department: user.department,
      grade: user.grade,
      additional_info: user.additional_info,
    };

    // 4. FastAPI 호출
    const response = await axios.post(`${FASTAPI_URL}/chat`, {
      message,
      history: history || [],
      user_info: userInfo,
      timetable: timetableData,
      is_first_question: isFirstQuestion || false,
    });

    const data = response.data;

    // // 5. 추가 정보 요청인 경우
    // if (data.type === "info_request") {
    //   return res.json({
    //     success: true,
    //     type: "info_request",
    //     reason: data.reason,
    //     suggestion: data.suggestion,
    //   });
    // }

    // 6. 정상 답변인 경우
    if (data.type === "answer") {
      return res.json({
        success: true,
        type: "answer",
        reply: data.reply,
        sources: data.sources || [],
      });
    }

    // 7. 에러인 경우
    if (data.type === "error") {
      return res.status(500).json({
        success: false,
        message: data.message,
        details: data.details,
      });
    }

    // 8. 알 수 없는 응답 타입
    return res.status(500).json({
      success: false,
      message: "알 수 없는 응답 형식입니다.",
    });

  } catch (err) {
    console.error("RAG Ask Error:", err);

    // FastAPI 연결 오류
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "AI 서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "답변 생성 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
};


// ==================== 번역 ====================
const translate = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    // 필수 필드 검증
    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "번역할 텍스트와 목표 언어가 필요합니다.",
      });
    }

    // 언어 코드 검증
    if (!["en", "ko"].includes(targetLanguage)) {
      return res.status(400).json({
        success: false,
        message: "지원하지 않는 언어입니다. (en, ko만 가능)",
      });
    }

    // FastAPI 번역 호출
    const response = await axios.post(`${FASTAPI_URL}/translate`, {
      text,
      target_language: targetLanguage,
    });

    return res.json({
      success: true,
      translated_text: response.data.translated_text,
    });

  } catch (err) {
    console.error("Translation Error:", err);

    // FastAPI 연결 오류
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "번역 서버와 연결할 수 없습니다.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "번역 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
};


module.exports = {
  askRAG,
  translate,
};