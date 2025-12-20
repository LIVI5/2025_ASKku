const { Timetable, TimetableItem } = require("../models");

// ---------------------- GET MY TIMETABLE ----------------------
const getMyTimetable = async (req, res) => {
  try {
    const userID = req.user.userID;
    
    const timetable = await Timetable.findOne({
      where: { userID },
      include: [{ model: TimetableItem, as: 'items' }] // 'as' should match the association alias in models/index.js
    });

    if (!timetable) {
        // This case might happen if a user was created before this logic was implemented.
        // We can create one for them on the fly.
        const newTimetable = await Timetable.create({ userID });
        return res.json({ success: true, timetable: newTimetable });
    }

    return res.json({ success: true, timetable });

  } catch (err) {
    console.error("Get Timetable Error:", err);
    return res.status(500).json({ success: false, message: "시간표 조회 중 서버 오류가 발생했습니다." });
  }
};

// ================= TIMETABLE ITEM (수업 등록/수정/삭제) =================

// CREATE ITEM
const addTimetableItem = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { courseName, dayOfWeek, startTime, endTime, location, alias, color } = req.body;

    // 1. Find the user's single timetable
    const timetable = await Timetable.findOne({ where: { userID } });

    if (!timetable) {
        // This should theoretically not happen for new users, but as a fallback.
        return res.status(404).json({ success: false, message: "사용자의 시간표를 찾을 수 없습니다. 다시 로그인 후 시도해주세요." });
    }

    // 2. Create the item associated with that timetable
    const newItem = await TimetableItem.create({
      timetableID: timetable.timetableID,
      courseName,
      dayOfWeek,
      startTime,
      endTime,
      location,
      alias,
      color
    });

    return res.status(201).json({ success: true, message: "과목이 추가되었습니다.", data: newItem });
  } catch (err) {
    console.error("Add Item Error:", err);
    return res.status(500).json({ success: false, message: "과목 추가 중 서버 오류가 발생했습니다." });
  }
};


// UPDATE ITEM
const updateTimetableItem = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { itemID } = req.params;

    const item = await TimetableItem.findByPk(itemID);
    if (!item) return res.status(404).json({ success: false, message: "수정할 과목을 찾을 수 없습니다." });

    // Authorization check: Ensure the item belongs to the current user's timetable
    const timetable = await Timetable.findOne({ where: { timetableID: item.timetableID, userID } });
    if (!timetable) return res.status(403).json({ success: false, message: "해당 과목을 수정할 권한이 없습니다." });

    await item.update(req.body);

    return res.json({ success: true, message: "과목 정보가 수정되었습니다.", data: item });

  } catch (err) {
    console.error("Update Item Error:", err);
    return res.status(500).json({ success: false, message: "과목 수정 중 서버 오류가 발생했습니다." });
  }
};


// DELETE ITEM
const deleteTimetableItem = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { itemID } = req.params;

    const item = await TimetableItem.findByPk(itemID);
    if (!item) return res.status(404).json({ success: false, message: "삭제할 과목을 찾을 수 없습니다." });

    // Authorization check
    const timetable = await Timetable.findOne({ where: { timetableID: item.timetableID, userID } });
    if (!timetable) return res.status(403).json({ success: false, message: "해당 과목을 삭제할 권한이 없습니다." });

    await item.destroy();

    return res.json({ success: true, message: "과목이 삭제되었습니다." });

  } catch (err) {
    console.error("Delete Item Error:", err);
    return res.status(500).json({ success: false, message: "과목 삭제 중 서버 오류가 발생했습니다." });
  }
};

module.exports = {
  getMyTimetable,
  addTimetableItem,
  updateTimetableItem,
  deleteTimetableItem
};
