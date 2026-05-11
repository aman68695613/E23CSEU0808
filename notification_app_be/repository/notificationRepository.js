const axios = require("axios");
const config = require("../config");
const { repoLog } = require("../middleware/requestLogger");
const { getHeaders } = require("../utils/authManager");

const baseUrl = config.evaluationApi.baseUrl + config.evaluationApi.notifPath;

async function fetchNotifs(params = {}) {
  const q = {};
  if (params.limit) q.limit = String(params.limit);
  if (params.page) q.page = String(params.page);
  if (params.notification_type) q.notification_type = params.notification_type;

  repoLog("info", "fetching with params: " + JSON.stringify(q));

  try {
    const headers = await getHeaders();
    const res = await axios.get(baseUrl, {
      params: q,
      headers: headers,
      timeout: config.evaluationApi.timeout,
    });

    const body = res.data;
    let items = [];

    if (Array.isArray(body)) {
      items = body;
    } else if (body.notifications && Array.isArray(body.notifications)) {
      items = body.notifications;
    } else if (typeof body === "object") {
      items = Object.values(body).find(Array.isArray) || [];
    }

    repoLog("info", "got " + items.length + " items");
    return items;
  } catch (e) {
    repoLog("error", "api call failed: " + e.message);
    throw new Error("api call failed: " + e.message);
  }
}

async function fetchAllTypes(pages = 3) {
  const types = config.types;
  repoLog("info", "fetching " + types.length + " types, " + pages + " pages each");

  const jobs = [];
  for (let i = 0; i < types.length; i++) {
    for (let pg = 1; pg <= pages; pg++) {
      jobs.push(fetchNotifs({ notification_type: types[i], limit: 10, page: pg }));
    }
  }

  const results = await Promise.allSettled(jobs);
  const all = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === "fulfilled") {
      all.push(...results[i].value);
    }
  }

  repoLog("info", "total merged: " + all.length);
  return all;
}

module.exports = { fetchNotifs, fetchAllTypes };
