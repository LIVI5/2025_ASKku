const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  createTimetable,
  getMyTimetables,
  updateTimetable,
  deleteTimetable,
  addTimetableItem,
  updateTimetableItem,
  deleteTimetableItem
} = require("../controllers/timetable.controller");


// ---- TIMETABLE ----
router.post("/", auth, createTimetable);
router.get("/", auth, getMyTimetables);
router.put("/:timetableID", auth, updateTimetable);
router.delete("/:timetableID", auth, deleteTimetable);

// ---- ITEMS ----
router.post("/:timetableID/items", auth, addTimetableItem);
router.put("/items/:itemID", auth, updateTimetableItem);
router.delete("/items/:itemID", auth, deleteTimetableItem);

module.exports = router;
