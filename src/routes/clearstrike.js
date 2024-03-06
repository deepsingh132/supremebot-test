const router = require("express").Router();
const clearStrike = require("../controllers/clearstrike");

router.get("/:id", clearStrike);

module.exports = router;