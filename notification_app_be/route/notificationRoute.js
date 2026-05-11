const express = require("express");
const { listAll, priorityInbox, health } = require("../handler/notificationHandler");

const router = express.Router();

router.get("/health", health);
router.get("/notifications", listAll);
router.get("/notifications/priority", priorityInbox);

module.exports = router;
