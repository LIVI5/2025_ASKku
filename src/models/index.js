// models/index.js

const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const db = {};

console.log("Loading models...");

// 모델 자동 로딩
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    console.log("Registering model:", file);
    const modelDefiner = require(path.join(__dirname, file));
    const model = modelDefiner(sequelize, DataTypes);
    db[model.name] = model;
  });

// =============================
// RELATIONSHIPS
// =============================
const {
  User,
  Timetable,
  TimetableItem,
  Bookmark,
  Schedule,
  Calendar
} = db;

// USER → TIMETABLE (1:N)
if (User && Timetable) {
  User.hasMany(Timetable, { foreignKey: "userID", onDelete: "CASCADE" });
  Timetable.belongsTo(User, { foreignKey: "userID" });
}

// TIMETABLE → TIMETABLE_ITEM (1:N)
if (Timetable && TimetableItem) {
  Timetable.hasMany(TimetableItem, { as: "items", foreignKey: "timetableID", onDelete: "CASCADE" });
  TimetableItem.belongsTo(Timetable, { foreignKey: "timetableID" });
}

// USER → BOOKMARK (1:N)
if (User && Bookmark) {
  User.hasMany(Bookmark, { foreignKey: "userID", onDelete: "CASCADE" });
  Bookmark.belongsTo(User, { foreignKey: "userID" });
}

// USER → CALENDAR (1:N)
if (User && Calendar) {
  User.hasMany(Calendar, {
    foreignKey: "userID",
    onDelete: "CASCADE"
  });

  Calendar.belongsTo(User, {
    foreignKey: "userID"
  });
}

// CALENDAR → CALENDAR_ITEM (1:N)
if (Calendar && Schedule) {
  Calendar.hasMany(Schedule, {
    foreignKey: "calendarID",
    onDelete: "CASCADE"
  });

  Schedule.belongsTo(Calendar, {
    foreignKey: "calendarID"
  });
}


// =============================
// EXPORT
// =============================
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;