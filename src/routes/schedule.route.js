const router = require("express").Router();
const auth = require("../middleware/auth.middleware");

const {
  getMyCalendars,
  updateCalendar,

  addScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  createScheduleFromChat,
} = require("../controllers/schedule.controller");

// ---- CALENDAR ----
router.get("/", auth, getMyCalendars);
router.put("/:calendarID", auth, updateCalendar);

// ---- SCHEDULE ITEMS ----
router.post("/:calendarID/items", auth, addScheduleItem);
router.put("/items/:itemID", auth, updateScheduleItem);
router.delete("/items/:itemID", auth, deleteScheduleItem);
router.post("/extract", auth, createScheduleFromChat); 

module.exports = router;
