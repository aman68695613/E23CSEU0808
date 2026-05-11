const config = {
  port: 5000,

  evaluationApi: {
    baseUrl: "http://4.224.186.213/evaluation-service",
    notifPath: "/notifications",
    authPath: "/auth",
    timeout: 8000,
  },

  auth: {
    email: "e23cseu0808@bennett.edu.in",
    name: "aman srivastava",
    rollNo: "e23cseu0808",
    accessCode: "TfDxgr",
    clientID: "eab5fe1b-0af4-4366-8006-88e2feded1fa",
    clientSecret: "cxZCRBmgwmeUcdsk",
  },

  types: ["Event", "Result", "Placement"],

  weights: {
    Placement: 30,
    Result: 20,
    Event: 10,
  },

  topCount: 10,
};

module.exports = config;
