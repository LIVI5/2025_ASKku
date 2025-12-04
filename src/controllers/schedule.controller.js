const { Calendar, Schedule } = require("../models");
const axios = require("axios");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

// ======================================================
//               일정 자동 생성 (LLM 기반)
// ======================================================
const createScheduleFromChat = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "question과 answer는 필수입니다.",
      });
    }

    // 1) FastAPI에 일정 추출 요청
    const response = await axios.post(`${FASTAPI_URL}/schedule/summary`, {
      question,
      answer,
    });

    let scheduleData = response.data?.schedule;

    // 2) null 혹은 undefined → 추출 실패
    if (!scheduleData) {
      return res.status(400).json({
        success: false,
        message: "일정을 생성할 수 없습니다.",
      });
    }

    // 3) 배열인지 단일 객체인지 통일
    const scheduleList = Array.isArray(scheduleData)
      ? scheduleData
      : [scheduleData];

    // 4) 최소한 title + startDate가 있어야 유효
    const validSchedules = scheduleList.filter(
      (s) => s?.title && s?.startDate
    );

    if (validSchedules.length === 0) {
      return res.status(400).json({
        success: false,
        message: "유효한 일정 정보를 찾을 수 없습니다.",
        raw: scheduleList,
      });
    }

    // 5) 기본 캘린더 조회 또는 생성
    let calendar = await Calendar.findOne({ where: { userID } });

    if (!calendar) {
      calendar = await Calendar.create({
        userID,
        title: "기본 캘린더",
        color: "#3B82F6",
      });
    }

    // 6) 각각의 일정 저장
    const createdSchedules = [];

    for (const s of validSchedules) {
      const created = await Schedule.create({
        calendarID: calendar.calendarID,
        title: s.title,
        description: s.description || null,
        startDate: s.startDate,
        endDate: s.endDate || s.startDate,
        startTime: s.startTime || null,
        endTime: s.endTime || null,
        isAllDay: s.isAllDay ?? false,
        type: s.type || "schedule",
        location: s.location || null,
    });


      createdSchedules.push(created);
    }

    return res.status(201).json({
      success: true,
      message: `${createdSchedules.length}개의 일정이 생성되었습니다.`,
      schedules: createdSchedules,
    });
  } catch (err) {
    console.error("Create Schedule Error:", err);

    // FastAPI가 400 보내는 경우
    if (err.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message: err.response.data.detail || "일정 추출 실패",
      });
    }

    // 기타 내부 오류
    return res.status(500).json({
      success: false,
      message: "자동 일정 생성 중 오류 발생",
      error: err.message,
    });
  }
};

// ======================================================
//                   CALENDAR CRUD
// ======================================================

// 내 캘린더 목록 조회
const getMyCalendars = async (req, res) => {
  try {
    const userID = req.user.userID;

    const calendars = await Calendar.findAll({
      where: { userID },
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      calendars,
    });
  } catch (err) {
    console.error("Get Calendars Error:", err);
    return res.status(500).json({
      success: false,
      message: "캘린더 조회 실패",
    });
  }
};

// 캘린더 수정
const updateCalendar = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { calendarID } = req.params;
    const { title } = req.body;

    const calendar = await Calendar.findOne({
      where: { calendarID, userID },
    });

    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: "캘린더를 찾을 수 없습니다.",
      });
    }

    calendar.title = title ?? calendar.title;
    await calendar.save();

    return res.json({
      success: true,
      message: "캘린더가 수정되었습니다.",
      calendar,
    });
  } catch (err) {
    console.error("Update Calendar Error:", err);
    return res.status(500).json({
      success: false,
      message: "캘린더 수정 실패",
    });
  }
};

// ======================================================
//                   SCHEDULE CRUD
// ======================================================

// 일정 추가
const addScheduleItem = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { calendarID } = req.params;

    const {
      title,
      description,
      startDate,
      endDate,
      isAllDay,
      type,
      location,
    } = req.body;

    // 본인 캘린더인지 확인
    const calendar = await Calendar.findOne({
      where: { calendarID, userID },
    });

    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: "캘린더가 존재하지 않습니다.",
      });
    }

    const schedule = await Schedule.create({
      calendarID,
      title,
      description,
      startDate,
      endDate,
      isAllDay,
      type,
      location,
    });

    return res.status(201).json({
      success: true,
      message: "일정이 추가되었습니다.",
      schedule,
    });
  } catch (err) {
    console.error("Add Schedule Error:", err);
    return res.status(500).json({
      success: false,
      message: "일정 추가 실패",
    });
  }
};

// 일정 수정
const updateScheduleItem = async (req, res) => {
  try {
    const { itemID } = req.params;

    const {
      title,
      description,
      startDate,
      endDate,
      isAllDay,
      type,
      location,
    } = req.body;

    const schedule = await Schedule.findByPk(itemID);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "일정을 찾을 수 없습니다.",
      });
    }

    schedule.title = title ?? schedule.title;
    schedule.description = description ?? schedule.description;
    schedule.startDate = startDate ?? schedule.startDate;
    schedule.endDate = endDate ?? schedule.endDate;
    schedule.isAllDay = isAllDay ?? schedule.isAllDay;
    schedule.type = type ?? schedule.type;
    schedule.location = location ?? schedule.location;

    await schedule.save();

    return res.json({
      success: true,
      message: "일정이 수정되었습니다.",
      schedule,
    });
  } catch (err) {
    console.error("Update Schedule Error:", err);
    return res.status(500).json({
      success: false,
      message: "일정 수정 실패",
    });
  }
};

// 일정 삭제
const deleteScheduleItem = async (req, res) => {
  try {
    const { itemID } = req.params;

    const schedule = await Schedule.findByPk(itemID);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "삭제할 일정이 없습니다.",
      });
    }

    await schedule.destroy();

    return res.json({
      success: true,
      message: "일정이 삭제되었습니다.",
    });
  } catch (err) {
    console.error("Delete Schedule Error:", err);
    return res.status(500).json({
      success: false,
      message: "일정 삭제 실패",
    });
  }
};

module.exports = {
  createScheduleFromChat,
  getMyCalendars,
  updateCalendar,
  addScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
};
