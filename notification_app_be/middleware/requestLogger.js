const { createLoggingMiddleware, logMessage } = require("../../logging_middleware");

const requestLogger = createLoggingMiddleware({
  stack: "backend",
  packageName: "handler",
  verbose: true,
});

function serviceLog(level, msg) {
  return logMessage(level, "service", msg, "backend");
}

function repoLog(level, msg) {
  return logMessage(level, "repository", msg, "backend");
}

function routeLog(level, msg) {
  return logMessage(level, "route", msg, "backend");
}

module.exports = { requestLogger, serviceLog, repoLog, routeLog };
