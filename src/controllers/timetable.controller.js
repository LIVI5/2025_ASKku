const { Timetable, TimetableItem } = require("../models");

// ---------------------- CREATE TIMETABLE ----------------------
const createTimetable = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { season, title } = req.body;

    const newTimetable = await Timetable.create({
      userID,
      season,
      title: title || `${season} 시간표`
    });

    return res.status(201).json({
      success: true,
      message: "시간표가 생성되었습니다.",
      data: newTimetable,
    });

  } catch (err) {
    console.error("Timetable Create Error:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};


// ---------------------- GET ALL TIMETABLES ----------------------
const getMyTimetables = async (req, res) => {
  try {
    const userID = req.user.userID;
    
    const timetables = await Timetable.findAll({
      where: { userID },
      include: [{ model: TimetableItem }]
    });

    return res.json({ success: true, timetables });

  } catch (err) {
    console.error("Get Timetables Error:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};


// ---------------------- UPDATE TIMETABLE ----------------------
const updateTimetable = async (req, res) => {
  try {
    const { timetableID } = req.params;
    const userID = req.user.userID;

    const timetable = await Timetable.findOne({ where: { timetableID, userID } });

    if (!timetable) {
      return res.status(403).json({ success: false, message: "권한이 없습니다." });
    }

    await timetable.update(req.body);

    return res.json({
      success: true,
      message: "시간표 정보가 수정되었습니다.",
      data: timetable,
    });

  } catch (err) {
    console.error("Update Timetable Error:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};


// ---------------------- DELETE TIMETABLE ----------------------
const deleteTimetable = async (req, res) => {
  try {
    const { timetableID } = req.params;
    const userID = req.user.userID;

    const timetable = await Timetable.findOne({ where: { timetableID, userID } });

    if (!timetable) return res.status(404).json({ success: false, message: "삭제할 시간표가 없습니다." });

    await timetable.destroy(); // CASCADE → item도 삭제됨

    return res.json({ success: true, message: "시간표가 삭제되었습니다." });

  } catch (err) {
    console.error("Delete Timetable Error:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};


// ================= TIMETABLE ITEM (수업 등록/수정/삭제) =================

// CREATE ITEM
const addTimetableItem = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { timetableID } = req.params;
    const { courseName, dayOfWeek, startTime, endTime, location } = req.body;

    const timetable = await Timetable.findOne({ where: { timetableID, userID } });

    if (!timetable) return res.status(403).json({ success: false, message: "해당 시간표에 접근할 수 없습니다." });

    const newItem = await TimetableItem.create({
      timetableID,
      courseName,
      dayOfWeek,
      startTime,
      endTime,
      location
    });

    return res.status(201).json({ success: true, message: "과목이 추가되었습니다.", data: newItem });
  } catch (err) {
    console.error("Add Item Error:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};


// UPDATE ITEM
const updateTimetableItem = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { itemID } = req.params;

    const item = await TimetableItem.findByPk(itemID);
    if (!item) return res.status(404).json({ success: false, message: "항목이 존재하지 않습니다." });

    const timetable = await Timetable.findOne({ where: { timetableID: item.timetableID, userID } });
    if (!timetable) return res.status(403).json({ success: false, message: "수정 권한이 없습니다." });

    await item.update(req.body);

    return res.json({ success: true, message: "과목 수정 완료", data: item });

  } catch (err) {
    console.error("Update Item Error:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};


// DELETE ITEM
const deleteTimetableItem = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { itemID } = req.params;

    const item = await TimetableItem.findByPk(itemID);
    if (!item) return res.status(404).json({ success: false, message: "항목 없음" });

    const timetable = await Timetable.findOne({ where: { timetableID: item.timetableID, userID } });

    if (!timetable) return res.status(403).json({ success: false, message: "삭제 권한이 없습니다." });

    await item.destroy();

    return res.json({ success: true, message: "과목 삭제 완료" });

  } catch (err) {
    console.error("Delete Item Error:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

module.exports = {
  createTimetable,
  getMyTimetables,
  updateTimetable,
  deleteTimetable,
  addTimetableItem,
  updateTimetableItem,
  deleteTimetableItem
};
