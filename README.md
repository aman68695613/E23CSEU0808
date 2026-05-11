# Notification Platform

**Name:** Aman Srivastava  
**Roll No:** E23CSEU0808  
**Email:** e23cseu0808@bennett.edu.in  
**GitHub:** aman68695613  
**Track:** Full Stack

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, Axios |
| Frontend | React 19, Material UI, Vite |
| Auth | JWT Bearer token (auto-refresh) |
| Logging | Custom shared middleware |

---

## Architecture

```
notification_app_fe (React, port 3000)
        |
        v
notification_app_be (Express, port 5000)
        |
        v
Evaluation API (4.224.186.213)
```

```
E23CSEU0808/
├── logging_middleware/            # Shared logging module
├── notification_system_design.md # Stages 1-5 design answers
├── notification_app_be/          # Stage 6: Backend
│   ├── config/
│   ├── handler/
│   ├── service/
│   ├── repository/
│   ├── route/
│   ├── utils/
│   └── server.js
├── notification_app_fe/          # Stage 7: Frontend
│   └── src/
│       ├── api/
│       ├── component/
│       ├── hook/
│       ├── page/
│       ├── state/
│       └── style/
├── screenshots/
└── videos/
```

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/health | Health check |
| GET | /api/notifications | All notifications |
| GET | /api/notifications?notification_type=Placement | Filter by type |
| GET | /api/notifications?page=2&limit=5 | Pagination |
| GET | /api/notifications/priority | Top 10 priority inbox |

Priority Ranking: Placement (30) > Result (20) > Event (10), then by newest first.

---

## How to Run

```bash
# Install
cd logging_middleware && npm install
cd ../notification_app_be && npm install
cd ../notification_app_fe && npm install

# Terminal 1 - Backend
cd notification_app_be && npm start

# Terminal 2 - Frontend
cd notification_app_fe && npm run dev
```

Backend: http://localhost:5000  
Frontend: http://localhost:3000

---

## Screenshots

![Screenshot 1](screenshots/Screenshot%202026-05-11%20125753.png)
![Screenshot 2](screenshots/Screenshot%202026-05-11%20125824.png)
![Screenshot 3](screenshots/Screenshot%202026-05-11%20125854.png)
![Screenshot 4](screenshots/Screenshot%202026-05-11%20125920.png)
![Screenshot 5](screenshots/Screenshot%202026-05-11%20130003.png)
![Screenshot 6](screenshots/Screenshot%202026-05-11%20130039.png)
![Screenshot 7](screenshots/Screenshot%202026-05-11%20130114.png)
![Screenshot 8](screenshots/Screenshot%202026-05-11%20130208.png)

---

## Video Demo

[Frontend Demo Recording](videos/NotifHub%20%E2%80%94%20Campus%20Notifications%20-%20Brave%202026-05-11%2013-12-48.mp4)
