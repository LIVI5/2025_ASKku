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
  // ❌ 삭제: Conversation, Message
} = db;

// USER → TIMETABLE (1:N)
if (User && Timetable) {
  User.hasMany(Timetable, { foreignKey: "userID", onDelete: "CASCADE" });
  Timetable.belongsTo(User, { foreignKey: "userID" });
}

// TIMETABLE → TIMETABLE_ITEM (1:N)
if (Timetable && TimetableItem) {
  Timetable.hasMany(TimetableItem, { foreignKey: "timetableID", onDelete: "CASCADE" });
  TimetableItem.belongsTo(Timetable, { foreignKey: "timetableID" });
}

// USER → BOOKMARK (1:N)
if (User && Bookmark) {
  User.hasMany(Bookmark, { foreignKey: "userID", onDelete: "CASCADE" });
  Bookmark.belongsTo(User, { foreignKey: "userID" });
}

// USER → SCHEDULE (1:N)
if (User && Schedule) {
  User.hasMany(Schedule, { foreignKey: "userID", onDelete: "CASCADE" });
  Schedule.belongsTo(User, { foreignKey: "userID" });
}

// =============================
// EXPORT
// =============================
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;