const { getNotifs, getPriorityNotifs } = require("../service/notificationService");
const { logMessage } = require("../../logging_middleware");

async function listAll(req, res) {
  try {
    const filters = {};
    if (req.query.page) filters.page = req.query.page;
    if (req.query.limit) filters.limit = req.query.limit;
    if (req.query.notification_type) filters.notification_type = req.query.notification_type;

    const data = await getNotifs(filters);
    return res.status(200).json(data);
  } catch (e) {
    logMessage("error", "handler", "listAll failed: " + e.message, "backend");
    return res.status(500).json({ error: "failed to get notifications", detail: e.message });
  }
}

async function priorityInbox(req, res) {
  try {
    const data = await getPriorityNotifs();
    return res.status(200).json(data);
  } catch (e) {
    logMessage("error", "handler", "priorityInbox failed: " + e.message, "backend");
    return res.status(500).json({ error: "failed to get priority notifications", detail: e.message });
  }
}

function health(req, res) {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
}

module.exports = { listAll, priorityInbox, health };
