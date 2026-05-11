const axios = require("axios");

const LOG_URL = "http://4.224.186.213/evaluation-service/logs";
let counter = 0;

async function sendLog(data) {
  try {
    const res = await axios.post(LOG_URL, data, {
      headers: { "Content-Type": "application/json" },
      timeout: 3000,
    });
    return res.data;
  } catch (e) {
    console.error("[log] send failed:", e.message);
    return null;
  }
}

function getSeverity(code) {
  if (code >= 500) return "error";
  if (code >= 400) return "warn";
  return "info";
}

function createLoggingMiddleware(options = {}) {
  const stack = options.stack || "backend";
  const pkg = options.packageName || "handler";
  const loud = options.verbose !== undefined ? options.verbose : true;

  return function (req, res, next) {
    counter++;
    const num = counter;
    const start = Date.now();
    const method = req.method;
    const url = req.originalUrl || req.url;

    if (loud) {
      console.log("[" + num + "] --> " + method + " " + url);
    }

    const origEnd = res.end;
    res.end = function (...args) {
      const ms = Date.now() - start;
      const sev = getSeverity(res.statusCode);
      const line = method + " " + url + " => " + res.statusCode + " (" + ms + "ms)";

      if (loud) {
        console.log("[" + num + "] <-- " + line);
      }

      sendLog({
        stack: stack,
        level: sev,
        package: pkg,
        message: line,
      });

      origEnd.apply(res, args);
    };

    next();
  };
}

function logMessage(level, pkg, msg, stack) {
  const payload = {
    stack: stack || "backend",
    level: level,
    package: pkg,
    message: msg,
  };

  console.log("[" + level.toUpperCase() + "] [" + pkg + "] " + msg);
  return sendLog(payload);
}

module.exports = { createLoggingMiddleware, logMessage, sendLog };
