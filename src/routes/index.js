const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "API root available" });
});

router.use("/users", require("./user.route"));
router.use("/chat", require("./chat.route"));

module.exports = router;
