import axios from "axios";

const LOG_URL = "http://4.224.186.213/evaluation-service/logs";

async function shipLog(entry) {
  try {
    await axios.post(LOG_URL, entry, { timeout: 3000 });
  } catch (e) {
    // silent
  }
}

function feLog(level, pkg, msg) {
  const ts = new Date().toISOString();
  const tag = "[" + level.toUpperCase() + "] [" + pkg + "] " + ts;

  if (level === "error") {
    console.error(tag + " - " + msg);
  } else if (level === "warn") {
    console.warn(tag + " - " + msg);
  } else {
    console.log(tag + " - " + msg);
  }

  shipLog({
    stack: "frontend",
    level: level,
    package: pkg,
    message: msg,
    timestamp: ts,
  });
}

export { feLog };
