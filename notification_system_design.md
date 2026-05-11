# Notification System Design

> Campus Notification Platform — Full Stack Track  
> Roll Number: E23CSEU0808

---

## Stage 1 — REST API Design & Real-Time Notification Mechanism

### Core Actions Identified

After going through the requirements, these are the essential operations our notification platform needs to handle:

1. **Fetching notifications** — students need to pull their unread/read notifications with pagination and filtering
2. **Creating notifications** — the admin or system pushes new notifications into the store
3. **Updating notification state** — marking individual items as read, or bulk-marking
4. **Removing old notifications** — cleanup stale entries
5. **Real-time delivery** — new notifications should appear without refreshing

### API Endpoints

#### 1. GET /api/notifications

Fetches a paginated list of notifications, optionally filtered by type.

**Query Parameters:**

| Param             | Type    | Default | Description                                       |
|-------------------|---------|---------|---------------------------------------------------|
| `page`            | integer | 1       | Which page to return                              |
| `limit`           | integer | 20      | How many items per page                           |
| `notification_type` | string | (all)  | Filter by "Event", "Result", or "Placement"      |

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "ID": "d1450f5a-8a88-4a34-9e69-3908ba1970bc",
      "Type": "Result",
      "Message": "mid-sem",
      "Timestamp": "2026-04-22 17:51:38"
    },
    {
      "ID": "b2e83194-ea5a-4b7c-93a5-1f2f408b61b0",
      "Type": "Placement",
      "Message": "CSK Corporation hiring",
      "Timestamp": "2026-04-22 17:51:18"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 5000000
}
```

**Error Responses:**
- `401 Unauthorized` — missing or invalid token
- `400 Bad Request` — invalid query parameter values (negative page, unrecognized type)
- `500 Internal Server Error` — something broke on our end

---

#### 2. GET /api/notifications/:id

Fetch a single notification by its unique ID.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "ID": "d1450f5a-8a88-4a34-9e69-3908ba1970bc",
  "Type": "Result",
  "Message": "mid-sem",
  "Timestamp": "2026-04-22 17:51:38",
  "StudentID": 1842,
  "IsRead": false
}
```

**Error:** `404 Not Found` if the ID doesn't match anything.

---

#### 3. POST /api/notifications

Creates a new notification entry.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": 1842,
  "type": "Placement",
  "message": "Infosys campus drive scheduled for next week"
}
```

**Response (201 Created):**
```json
{
  "ID": "a7b3c921-...",
  "message": "notification created successfully"
}
```

**Validation rules:**
- `type` must be one of: Event, Result, Placement
- `message` cannot be empty or exceed 500 characters
- `studentId` must reference a valid student

---

#### 4. PUT /api/notifications/:id

Updates an existing notification (primarily for toggling read status).

**Request Body:**
```json
{
  "isRead": true
}
```

**Response (200 OK):**
```json
{
  "ID": "d1450f5a-...",
  "message": "notification updated"
}
```

---

#### 5. DELETE /api/notifications/:id

Removes a notification permanently.

**Response (200 OK):**
```json
{
  "message": "notification removed"
}
```

---

#### 6. POST /api/notifications/mark-read

Bulk mark notifications as read. Useful for "Mark all as read" button in the UI.

**Request Body:**
```json
{
  "notificationIds": [
    "d1450f5a-...",
    "b2e83194-..."
  ]
}
```

**Response (200 OK):**
```json
{
  "updated": 2,
  "message": "notifications marked as read"
}
```

---

### Real-Time Notification Mechanism

I'm going with **Server-Sent Events (SSE)** instead of WebSockets. Here's my reasoning:

**Why SSE over WebSocket?**

| Aspect             | SSE                                      | WebSocket                                |
|--------------------|------------------------------------------|------------------------------------------|
| Direction          | Server → Client (one-way)               | Bidirectional                            |
| Complexity         | Simple, works over HTTP/1.1             | Needs upgrade handshake, custom protocol |
| Reconnection       | Built-in auto-reconnect                 | Manual reconnect logic needed            |
| Our use case       | Students only *receive* notifications   | Overkill — students don't *send* data   |

**SSE Endpoint: GET /api/notifications/stream**

The client opens a persistent connection. When a new notification is created (via POST), the server pushes an event to all connected clients who are subscribed to that student's feed.

```
// Server pushes this whenever a new notification lands
event: new-notification
data: {"ID":"abc123","Type":"Placement","Message":"Google hiring","Timestamp":"..."}
```

**Implementation sketch (Express):**
```javascript
app.get("/api/notifications/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // register this client
  const clientId = Date.now();
  activeClients.set(clientId, res);

  req.on("close", () => {
    activeClients.delete(clientId);
  });
});
```

---

### Logging Middleware

The logging middleware sits as the first middleware in the Express chain and does two things:

1. **Console output** — prints request method, URL, and response time for local debugging
2. **Remote log shipping** — sends a structured JSON payload to the central logging service

**Log payload structure:**
```json
{
  "stack": "backend",
  "level": "info",
  "package": "handler",
  "message": "GET /api/notifications => 200 (34ms)"
}
```

The severity level is automatically derived from the HTTP status code:
- 2xx/3xx → `info`
- 4xx → `warn`  
- 5xx → `error`

The middleware is implemented as a reusable package in `logging_middleware/` so both the backend and frontend can import it. It uses a fire-and-forget pattern — log shipping never blocks the actual response.

---

## Stage 2 — Persistent Storage Design

### Database Choice: PostgreSQL

I picked PostgreSQL for these reasons:

1. **Structured data with known schema** — notifications have a fixed shape (id, type, message, timestamp, studentId, isRead). A relational DB maps to this naturally. No need for the schema flexibility of MongoDB here.

2. **ENUM support** — Postgres has native ENUM types, which is perfect for `notification_type` since we only have three valid values (Event, Result, Placement). This gives us built-in validation at the DB level.

3. **Indexing capabilities** — Postgres supports partial indexes, composite indexes, and GIN indexes. When the table grows to 5 million rows, these become essential.

4. **ACID compliance** — we need transactional guarantees when doing bulk operations like "mark all as read" for a student. Postgres handles this out of the box.

5. **Scalability path** — Postgres supports read replicas, partitioning, and connection pooling (PgBouncer). Good for growth from 50K students upward.

**Why not MySQL?** — MySQL works too, but Postgres has better support for UUIDs as primary keys, richer indexing options, and native JSONB if we ever need flexible fields.

**Why not MongoDB?** — Our data is inherently relational (students → notifications). With MongoDB we'd need to either embed notifications inside student documents (which breaks at 5M notifications) or use references (losing the main advantage of document stores).

### Schema

```sql
CREATE TYPE notification_type_enum AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE students (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    notification_type notification_type_enum NOT NULL,
    message           TEXT NOT NULL,
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- essential indexes for common access patterns
CREATE INDEX idx_notif_student_unread 
    ON notifications (student_id, is_read, created_at DESC);

CREATE INDEX idx_notif_type 
    ON notifications (notification_type);
```

### Problems at Scale (50K students, 5M notifications)

1. **No indexes** → every query does a full sequential scan across 5M rows. Even a simple lookup by student_id touches every single row.

2. **SELECT * is wasteful** → pulling every column when you only need id + message + type wastes bandwidth and memory, especially with TEXT fields.

3. **ORDER BY without index** → Postgres has to load all matching rows into memory and sort them (in-memory or spilling to disk). With millions of rows this can eat GBs of RAM.

4. **No pagination** → returning all 5M notifications at once is a guaranteed timeout/OOM.

5. **Connection exhaustion** — 50K students all hitting the same table without connection pooling will max out Postgres's default 100 connections fast.

---

## Stage 3 — Query Optimization

### The Slow Query

```sql
SELECT * FROM notifications
WHERE studentID = 1842 AND isRead = false
ORDER BY createdAt ASC;
```

### Why Is It Slow?

1. **No composite index** — without an index on `(studentID, isRead, createdAt)`, Postgres does a sequential scan across all 5 million rows, checking each row's `studentID` and `isRead` values one by one.

2. **Sort operation** — after filtering, the DB has to sort the matching rows by `createdAt`. Without an index that already stores rows in sorted order, this requires an in-memory (or on-disk) sort. For a student with thousands of unread notifications, this is expensive.

3. **SELECT * fetches everything** — we're pulling all columns including the message TEXT field, which increases the amount of data that needs to be read from disk and sent over the wire. If we only need id, type, and message for a notification list view, we should select only those columns.

**Estimated computational cost:**
- Sequential scan: O(N) where N = 5,000,000 rows
- In-memory sort on results: O(K log K) where K = number of matching rows
- Combined: this could take several seconds on a cold cache

### Teammate's Indexing Suggestion — Is It Sound?

The suggestion to "add indexes on every column" is **not a good approach**. Here's why:

1. **Storage overhead** — each index creates a separate B-tree on disk. Indexing every column on a 5M-row table could easily double the storage footprint.

2. **Write penalty** — every INSERT, UPDATE, or DELETE now has to update *all* those indexes. For a notification system that's constantly writing new entries, this degrades write performance significantly.

3. **Query planner can't combine them well** — Postgres can do a BitmapAnd to combine two single-column indexes, but this is slower than a single composite index that covers the entire WHERE + ORDER BY clause.

**Better approach: one composite index.**

```sql
CREATE INDEX idx_student_unread_chrono 
    ON notifications (student_id, is_read, created_at ASC);
```

This single index satisfies:
- The `WHERE student_id = 1842` filter (first column in the B-tree)
- The `AND is_read = false` filter (second column)
- The `ORDER BY created_at ASC` sort (third column — already in order)

Postgres can now do an **index-only scan** (or at minimum a very efficient index scan), jumping directly to the relevant leaf nodes without touching 99.9% of the table.

### Query: Students with Placement Notifications in the Last 7 Days

```sql
SELECT DISTINCT s.id, s.name, s.email
FROM students s
INNER JOIN notifications n ON s.id = n.student_id
WHERE n.notification_type = 'Placement'
  AND n.created_at >= NOW() - INTERVAL '7 days';
```

To support this query efficiently, I'd add:

```sql
CREATE INDEX idx_notif_placement_recent 
    ON notifications (notification_type, created_at DESC)
    WHERE notification_type = 'Placement';
```

This is a **partial index** — it only indexes Placement-type rows, keeping it small and fast.

---

## Stage 4 — Performance Improvement Strategy

### Problem

Notifications are being fetched from the database on every single page load across the platform. With 50K students and several page loads per session, the DB is getting overwhelmed.

### Proposed Solutions

| Strategy | How It Helps | Trade-off |
|----------|-------------|-----------|
| **Redis cache layer** | Cache recent notifications per student in Redis with a 60-second TTL. Cache hit rate should be 85%+, reducing DB load dramatically. | Need to handle cache invalidation when new notifications arrive. Also adds Redis as an infrastructure dependency. |
| **API-level pagination** | Instead of loading ALL notifications for a student, only fetch the latest 20. Next page only loads if the student scrolls down. | Doesn't reduce the number of DB queries, just the size of each query response. Still useful but not sufficient alone. |
| **Stale-while-revalidate on the client** | The frontend shows cached data immediately and refreshes in the background. Users see instant UI with minimal staleness (< 60 seconds). | Student might see a notification from 30 seconds ago as "new" for a brief period. Acceptable for this use case. |
| **Server-Sent Events (SSE) for new items** | Instead of polling the DB, push new notifications to connected clients in real-time. DB is only read once (on page load), then new items arrive via push. | Need to maintain long-lived connections. Connection count could be high with 50K concurrent students. Mitigate with connection pooling and load balancing. |
| **Database read replicas** | Route all read queries to one or more replicas, keeping the primary for writes only. Distributes read load. | Adds replication lag (usually <1 second). Slightly stale data for reads. Acceptable for notifications. |

### My Recommended Approach

Layer these strategies together:

1. **First line of defense: Redis cache.** When a student loads notifications, check Redis first. If we have a cache entry younger than 60 seconds, return it immediately. On cache miss, query the DB, store in Redis, return.

2. **Second: Pagination.** Always paginate — never return more than 20-30 items per request. This caps the data transfer and query cost.

3. **Third: SSE for new notifications.** After the initial page load, don't poll. Instead, open an SSE connection and push new items as they come in. This eliminates repeated DB reads entirely for active sessions.

4. **Fourth: Read replicas for scale.** When we grow past what one DB instance can handle, stand up 2-3 read replicas and route notification reads there.

**Pseudocode for the caching layer:**
```
function getNotifications(studentId, page, limit):
    cacheKey = "notifs:" + studentId + ":" + page
    cached = redis.get(cacheKey)
    
    if cached is not null:
        return JSON.parse(cached)
    
    results = db.query(
        "SELECT * FROM notifications WHERE student_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [studentId, limit, (page - 1) * limit]
    )
    
    redis.setex(cacheKey, 60, JSON.stringify(results))
    return results
```

**Cache invalidation:** Whenever a new notification is created (POST), we delete the student's cache keys so the next read gets fresh data:
```
function onNewNotification(studentId):
    redis.del("notifs:" + studentId + ":*")
    pushViaSSE(studentId, newNotification)
```

---

## Stage 5 — Reliable Notification Delivery

### The Original Pseudocode

```
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        send_email(student_id, message)     # calls Email API
        save_to_db(student_id, message)      # DB insert
        push_to_app(student_id, message)     # real-time push
```

### What Goes Wrong

I can see several problems with this implementation:

**1. Sequential execution with no error isolation.**
If `send_email` throws an exception for student #201, both `save_to_db` and `push_to_app` are skipped for that student AND the loop breaks — so students #202 through #50000 never get anything at all.

**2. DB save happens AFTER email.**
The email is the most unreliable step (external API, rate limits, network issues), yet it runs first. If it fails, the notification never gets persisted to the database. The DB should be the source of truth and should be written to first.

**3. No retry mechanism.**
When `send_email` fails for 200 students at midday (likely due to email API rate limits or a transient outage), those 200 students simply don't get emails. There's no queue, no retry, no dead-letter log.

**4. Synchronous processing is too slow.**
50,000 iterations where each one makes 3 sequential network calls (email API + DB insert + push) will take a very long time. Even at 100ms per student, that's 5000 seconds (~83 minutes).

**5. No idempotency.**
If the process crashes halfway and you restart it, students who already received their email will get duplicate emails.

### Redesigned Implementation

```
function notify_all(student_ids, message):
    batchId = generate_unique_id()
    
    // Step 1: Persist ALL notifications to DB in a single batch insert.
    // This is our source of truth. Even if everything else fails, 
    // the notification exists in the database.
    db.batch_insert(
        "INSERT INTO notifications (id, student_id, message, email_sent, push_sent) VALUES ...",
        student_ids.map(sid => [generate_id(), sid, message, false, false])
    )
    
    // Step 2: Enqueue individual delivery jobs for each student.
    // A message queue (RabbitMQ, Redis Queue, etc.) handles retries,
    // concurrency limits, and dead-letter routing for us.
    for student_id in student_ids:
        queue.enqueue("notification_delivery", {
            student_id: student_id,
            message: message,
            batch_id: batchId,
            attempt: 1
        })


// Worker process — runs independently, picks jobs off the queue
worker function process_delivery(job):
    // Step 3: Send email with error handling
    try:
        send_email(job.student_id, job.message)
        db.update("UPDATE notifications SET email_sent = true WHERE student_id = $1 AND batch_id = $2",
                  [job.student_id, job.batch_id])
    catch error:
        log_error("email failed for student " + job.student_id + ": " + error.message)
        if job.attempt < 3:
            // retry with exponential backoff
            queue.enqueue("notification_delivery", {
                ...job,
                attempt: job.attempt + 1
            }, delay = 30 * (2 ^ job.attempt) seconds)
        else:
            // give up after 3 attempts, log to dead-letter queue
            queue.enqueue("dead_letter", job)
    
    // Step 4: Push to app — independent of email success/failure
    try:
        push_to_app(job.student_id, job.message)
        db.update("UPDATE notifications SET push_sent = true WHERE student_id = $1 AND batch_id = $2",
                  [job.student_id, job.batch_id])
    catch error:
        log_warning("push failed for student " + job.student_id)
        // push failures are less critical, just log them
```

### Key Improvements

1. **DB first** — notifications are persisted before any delivery attempt. Even if email and push both fail, the student can still see the notification in the app on next load.

2. **Error isolation** — each student's delivery is an independent job. One failure doesn't cascade to others.

3. **Retry with backoff** — transient failures (rate limits, network blips) are handled automatically with exponential delays (30s, 60s, 120s).

4. **Dead-letter queue** — permanent failures land in a separate queue for manual review instead of being silently lost.

5. **Concurrent processing** — multiple workers can process the queue in parallel. 50,000 notifications with 10 workers at 100ms each = ~500 seconds (~8 minutes) vs. 83 minutes sequentially.

6. **Idempotency** — the `email_sent` and `push_sent` flags in the DB prevent duplicate sends on restarts.

### Should DB Save and Email Happen Together?

No, they should NOT be tightly coupled. Here's why:

- The database is **local infrastructure** — fast, reliable, under our control.
- Email is an **external service** — slow, rate-limited, prone to outages.

Coupling them means the reliable operation (DB) inherits the unreliability of the external operation (email). By separating them, we guarantee data persistence regardless of email delivery status.
