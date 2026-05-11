const API_BASE = "http://localhost:5000/api";
const EVAL_API = "http://4.224.186.213/evaluation-service";

const AUTH_CREDS = {
  email: "e23cseu0808@bennett.edu.in",
  name: "aman srivastava",
  rollNo: "e23cseu0808",
  accessCode: "TfDxgr",
  clientID: "eab5fe1b-0af4-4366-8006-88e2feded1fa",
  clientSecret: "cxZCRBmgwmeUcdsk",
};

const NOTIF_TYPES = ["Event", "Result", "Placement"];

const PRIORITY_MAP = {
  Placement: { weight: 30, label: "High", color: "#e53935" },
  Result: { weight: 20, label: "Medium", color: "#fb8c00" },
  Event: { weight: 10, label: "Low", color: "#43a047" },
};

export { API_BASE, EVAL_API, AUTH_CREDS, NOTIF_TYPES, PRIORITY_MAP };
