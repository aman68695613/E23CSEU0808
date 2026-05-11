const express = require("express");
const cors = require("cors");
const config = require("./config");
const { requestLogger } = require("./middleware/requestLogger");
const { logMessage } = require("../logging_middleware");
const routes = require("./route/notificationRoute");

const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use(requestLogger);

app.use("/api", routes);

app.get("/", function (req, res) {
  res.json({
    service: "notification-backend",
    version: "1.0.0",
    endpoints: [
      "GET /api/health",
      "GET /api/notifications",
      "GET /api/notifications/priority",
    ],
  });
});

app.use(function (req, res) {
  res.status(404).json({
    error: "not found",
    path: req.originalUrl,
  });
});

app.use(function (err, req, res, _next) {
  logMessage("error", "handler", "unhandled: " + err.message, "backend");
  res.status(500).json({ error: "server error", message: err.message });
});

app.listen(config.port, function () {
  console.log("backend running on http://localhost:" + config.port);
  console.log("api base: http://localhost:" + config.port + "/api");
  logMessage("info", "service", "started on port " + config.port, "backend");
});
