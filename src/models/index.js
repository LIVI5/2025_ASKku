const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const db = {};

console.log("Loading models...");

fs.readdirSync(__dirname)
  .filter(file => file !== "index.js" && file.endsWith(".js"))
  .forEach(file => {
    console.log("Registering model:", file);
    const modelDefiner = require(path.join(__dirname, file));
    const model = modelDefiner(sequelize, DataTypes);
    db[model.name] = model;
  });

// 관계 설정
if (db.users && db.conversations) {
  db.users.hasMany(db.conversations, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.conversations.belongsTo(db.users, { foreignKey: "user_id" });
}

if (db.conversations && db.messages) {
  db.conversations.hasMany(db.messages, { foreignKey: "conv_id", onDelete: "CASCADE" });
  db.messages.belongsTo(db.conversations, { foreignKey: "conv_id" });
}

db.sequelize = sequelize;
module.exports = db;
