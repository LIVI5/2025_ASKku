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
  Conversation,
  Message,
  Bookmark,
  Schedule,
} = db;

// USER → TIMETABLE (1:N)
if (User && Timetable) {
  User.hasMany(Timetable, { foreignKey: "userID", onDelete: "CASCADE" });
  Timetable.belongsTo(User, { foreignKey: "userID" });
}

// USER → CONVERSATION (1:N)
if (User && Conversation) {
  User.hasMany(Conversation, { foreignKey: "userID", onDelete: "CASCADE" });
  Conversation.belongsTo(User, { foreignKey: "userID" });
}

// CONVERSATION → MESSAGE (1:N)
if (Conversation && Message) {
  Conversation.hasMany(Message, { foreignKey: "convID", onDelete: "CASCADE" });
  Message.belongsTo(Conversation, { foreignKey: "convID" });
}

// USER → MESSAGE (1:N) (optional because assistant messages may have null userID)
if (User && Message) {
  User.hasMany(Message, { foreignKey: "userID", onDelete: "SET NULL" });
  Message.belongsTo(User, { foreignKey: "userID" });
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

if (db.Timetable && db.TimetableItem) {
  db.Timetable.hasMany(db.TimetableItem, { foreignKey: "timetableID", onDelete: "CASCADE" });
  db.TimetableItem.belongsTo(db.Timetable, { foreignKey: "timetableID" });
}


// =============================
// EXPORT
// =============================
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
