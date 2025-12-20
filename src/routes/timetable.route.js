const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  getMyTimetable,
  addTimetableItem,
  updateTimetableItem,
  deleteTimetableItem
} = require("../controllers/timetable.controller");


// ---- TIMETABLE & ITEMS ----

// 내 시간표 조회 (수업 포함)
router.get("/my", auth, getMyTimetable);

// 시간표에 수업(과목) 추가
router.post("/my/items", auth, addTimetableItem);

// 수업(과목) 수정
router.put("/my/items/:itemID", auth, updateTimetableItem);

// 수업(과목) 삭제
router.delete("/my/items/:itemID", auth, deleteTimetableItem);

module.exports = router;
