const router = require("express").Router();
const auth = require("../middleware/auth.middleware");

const {
  getMyCalendars,
  updateCalendar,
  createCalendar, // New
  deleteCalendar, // New
  getPrimaryCalendar, // New

  addScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  addPrimaryScheduleItem, // New
  createScheduleFromChat,
} = require("../controllers/schedule.controller");

// ---- CALENDAR ----
router.get("/primary", auth, getPrimaryCalendar); // New primary calendar route
router.post("/", auth, createCalendar); // New create calendar route
router.get("/", auth, getMyCalendars);
router.put("/:calendarID", auth, updateCalendar);
router.delete("/:calendarID", auth, deleteCalendar); // New delete calendar route

// ---- SCHEDULE ITEMS ----
router.post("/primary/items", auth, addPrimaryScheduleItem); // New add item to primary route
router.post("/:calendarID/items", auth, addScheduleItem);
router.put("/items/:itemID", auth, updateScheduleItem);
router.delete("/items/:itemID", auth, deleteScheduleItem);
router.post("/extract", auth, createScheduleFromChat); 

module.exports = router;
