const fs = require("fs");
const path = require("path");
const sequelize = require("../config/db");

const db = {};

fs.readdirSync(__dirname)
  .filter(file => file !== "index.js" && file.endsWith(".js"))
  .forEach(file => {
    const modelDefiner = require(path.join(__dirname, file));
    const model = modelDefiner(sequelize);
    db[model.name] = model;
  });

db.sequelize = sequelize;

module.exports = db;
