const path = require("path");
const fs = require("fs");
const sequelize = require("./db");

const initDB = async () => {
  try {
    console.log("Loading models...");

    const modelsPath = path.join(__dirname, "../models");
    const modelFiles = fs.readdirSync(modelsPath).filter((f) => f.endsWith(".js") && f !== "index.js");

    modelFiles.forEach((file) => {
      console.log(`Registering model: ${file}`);
      require(path.join(modelsPath, file))(sequelize);
    });

    console.log("Syncing database...");
    await sequelize.sync({ alter: true });

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("DB initialization failed:", error.message);
    process.exit(1);
  }
};

module.exports = { initDB };
