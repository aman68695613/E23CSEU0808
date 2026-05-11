const { fetchNotifs, fetchAllTypes } = require("../repository/notificationRepository");
const { topPriority } = require("../utils/priorityCalculator");
const { serviceLog } = require("../middleware/requestLogger");

function normalize(raw) {
  return {
    id: raw.ID || raw.id || "unknown",
    type: raw.Type || raw.type || "Event",
    message: raw.Message || raw.message || "",
    timestamp: raw.Timestamp || raw.timestamp || new Date().toISOString(),
    _raw: raw,
  };
}

async function getNotifs(filters) {
  serviceLog("info", "getNotifs called with: " + JSON.stringify(filters));

  const raw = await fetchNotifs(filters);
  const clean = raw.map(normalize);

  return {
    notifications: clean,
    count: clean.length,
    filters: filters,
  };
}

async function getPriorityNotifs() {
  serviceLog("info", "building priority inbox");

  const all = await fetchAllTypes(3);
  serviceLog("info", "got " + all.length + " total to rank");

  const seen = new Set();
  const unique = [];
  for (let i = 0; i < all.length; i++) {
    const nid = all[i].ID || all[i].id || all[i]._id;
    if (nid && !seen.has(nid)) {
      seen.add(nid);
      unique.push(all[i]);
    }
  }

  serviceLog("info", "after dedup: " + unique.length + " unique");

  const top = topPriority(unique, 10);

  const cleaned = top.map(function (item) {
    return {
      id: item.ID || item.id || "unknown",
      type: item.Type || item.type || "Event",
      message: item.Message || item.message || "",
      timestamp: item.Timestamp || item.timestamp || "",
      _priorityWeight: item._priorityWeight,
      _priorityLabel: item._priorityLabel,
    };
  });

  return {
    priorityNotifications: cleaned,
    totalConsidered: unique.length,
    returned: cleaned.length,
  };
}

module.exports = { getNotifs, getPriorityNotifs };
