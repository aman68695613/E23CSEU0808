import axios from "axios";
import { API_BASE, EVAL_API, AUTH_CREDS } from "../config/constants";
import { feLog } from "../middleware/loggingMiddleware";

let savedToken = null;
let tokenExpiry = 0;

async function grabToken() {
  const now = Math.floor(Date.now() / 1000);
  if (savedToken && tokenExpiry > now + 60) return savedToken;

  feLog("info", "api", "getting auth token");
  try {
    const res = await axios.post(EVAL_API + "/auth", AUTH_CREDS, { timeout: 10000 });
    savedToken = res.data.access_token;
    tokenExpiry = res.data.expires_in || now + 3600;
    return savedToken;
  } catch (e) {
    feLog("error", "api", "auth failed: " + e.message);
    if (savedToken) return savedToken;
    throw e;
  }
}

const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(function (cfg) {
  feLog("info", "api", cfg.method.toUpperCase() + " " + cfg.url);
  return cfg;
});

http.interceptors.response.use(
  function (res) {
    feLog("info", "api", res.status + " from " + res.config.url);
    return res;
  },
  function (err) {
    feLog("error", "api", "request failed: " + err.message);
    return Promise.reject(err);
  }
);

async function getNotifications(opts = {}) {
  const page = opts.page || 1;
  const limit = opts.limit || 10;
  const type = opts.notificationType || "";

  const params = { page: page, limit: limit };
  if (type) params.notification_type = type;

  try {
    const res = await http.get("/notifications", { params: params });
    return res.data;
  } catch (e) {
    feLog("warn", "api", "backend down, trying direct api");
    return directFetch(params);
  }
}

async function getPriorityNotifications() {
  try {
    const res = await http.get("/notifications/priority");
    return res.data;
  } catch (e) {
    feLog("warn", "api", "priority endpoint down, doing it locally");
    return localPriority();
  }
}

async function directFetch(params) {
  try {
    const tk = await grabToken();
    const res = await axios.get(EVAL_API + "/notifications", {
      params: params,
      headers: { Authorization: "Bearer " + tk },
      timeout: 10000,
    });

    const body = res.data;
    let items = [];
    if (Array.isArray(body)) items = body;
    else if (body.notifications) items = body.notifications;

    return { notifications: cleanList(items), count: items.length };
  } catch (e) {
    feLog("error", "api", "direct api also failed: " + e.message);
    throw e;
  }
}

async function localPriority() {
  const types = ["Placement", "Result", "Event"];
  const wt = { Placement: 30, Result: 20, Event: 10 };

  let tk = null;
  try { tk = await grabToken(); } catch (e) { /* skip */ }

  const headers = tk ? { Authorization: "Bearer " + tk } : {};

  const fetches = types.map(function (t) {
    return axios
      .get(EVAL_API + "/notifications", {
        params: { notification_type: t, limit: 10 },
        headers: headers,
        timeout: 10000,
      })
      .then(function (r) {
        const d = r.data;
        return Array.isArray(d) ? d : d.notifications || [];
      })
      .catch(function () { return []; });
  });

  const results = await Promise.all(fetches);
  const merged = results.flat();

  const ids = new Set();
  const unique = merged.filter(function (n) {
    const nid = n.ID || n.id;
    if (ids.has(nid)) return false;
    ids.add(nid);
    return true;
  });

  unique.sort(function (a, b) {
    const wa = wt[a.Type || a.type] || 1;
    const wb = wt[b.Type || b.type] || 1;
    if (wb !== wa) return wb - wa;
    return new Date(b.Timestamp || b.timestamp) - new Date(a.Timestamp || a.timestamp);
  });

  const top = unique.slice(0, 10).map(function (n) {
    const w = wt[n.Type || n.type] || 1;
    return {
      ...n,
      _priorityWeight: w,
      _priorityLabel: w >= 30 ? "high" : w >= 20 ? "medium" : "low",
    };
  });

  return {
    priorityNotifications: cleanList(top),
    totalConsidered: unique.length,
    returned: top.length,
  };
}

function cleanList(items) {
  return items.map(function (n) {
    return {
      id: n.ID || n.id || "unknown",
      type: n.Type || n.type || "Event",
      message: n.Message || n.message || "",
      timestamp: n.Timestamp || n.timestamp || "",
      _priorityWeight: n._priorityWeight,
      _priorityLabel: n._priorityLabel,
    };
  });
}

export { getNotifications, getPriorityNotifications };
