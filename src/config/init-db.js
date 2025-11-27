const sequelize = require("./db");
const db = require("../models");

async function initDB() {
  try {
    console.log("Syncing database...");
    await sequelize.sync({ alter: true });
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("DB initialization failed:", error.message);
    process.exit(1);
  }
}

module.exports = { initDB };
