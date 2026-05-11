const axios = require("axios");
const config = require("../config");
const { serviceLog } = require("../middleware/requestLogger");

let token = null;
let expiry = 0;

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  if (token && expiry > now + 60) {
    return token;
  }

  serviceLog("info", "getting new auth token");

  try {
    const url = config.evaluationApi.baseUrl + config.evaluationApi.authPath;
    const res = await axios.post(url, config.auth, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    token = res.data.access_token;
    expiry = res.data.expires_in || now + 3600;
    serviceLog("info", "token received, expires at " + expiry);
    return token;
  } catch (e) {
    serviceLog("error", "auth failed: " + e.message);
    if (token) return token;
    throw new Error("auth failed: " + e.message);
  }
}

async function getHeaders() {
  const t = await getToken();
  return {
    Authorization: "Bearer " + t,
    "Content-Type": "application/json",
  };
}

module.exports = { getToken, getHeaders };
