require("dotenv").config();
const app = require("./app");
const { initDB } = require("./config/init-db");

const PORT = process.env.PORT || 4000;

(async () => {
  await initDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
