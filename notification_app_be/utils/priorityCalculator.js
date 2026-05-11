const config = require("../config");

function getWeight(notif) {
  const t = notif.Type || notif.type || "";
  return config.weights[t] || 1;
}

function parseTime(notif) {
  const raw = notif.Timestamp || notif.timestamp || "";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

function compare(a, b) {
  const diff = getWeight(b) - getWeight(a);
  if (diff !== 0) return diff;
  return parseTime(b) - parseTime(a);
}

function topPriority(list, n) {
  const count = n || config.topCount;

  const enriched = list.map(function (item) {
    const w = getWeight(item);
    return {
      ...item,
      _priorityWeight: w,
      _priorityLabel: w >= 30 ? "high" : w >= 20 ? "medium" : "low",
    };
  });

  enriched.sort(compare);
  return enriched.slice(0, count);
}

module.exports = { getWeight, compare, topPriority };
