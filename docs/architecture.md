# QuickNotes System Architecture

## Overview

QuickNotes is a note-taking service that needs to grow from a browser-only application into an online service supporting approximately 1 million users.

The architecture is designed to handle a read-heavy workload, keep response times low, protect user data, and avoid single points of failure.

---

## 1. Functional Requirements

The system must allow users to:

1. Create an account and authenticate.
2. Create notes.
3. View their notes.
4. Update notes.
5. Delete notes.
6. Search their notes.
7. Create and manage tags.
8. Assign tags to notes.
9. View notes by tag.
10. Access the service from a web browser.

---

## 2. Non-Functional Requirements

### Availability

The service should remain available even if one application server or other individual infrastructure component fails.

### Performance

Common operations such as loading notes should normally respond within a few hundred milliseconds.

### Scalability

The system should scale horizontally by adding additional application servers when traffic increases.

### Security

User authentication, authorization, HTTPS, input validation, and secure password hashing must protect user data.

### Durability

User notes should not be lost if an application server or cache fails.

### Maintainability

The system should separate the frontend, application servers, cache, database, and asynchronous processing components so each layer can be maintained independently.

---

## 3. Load Estimate for 1 Million Users

These are planning estimates rather than measured production traffic.

### Assumptions

Assume:

- 1,000,000 registered users
- 20% of users are active on a typical day
- 200,000 daily active users
- Each active user performs approximately 50 read requests per day
- Each active user performs approximately 5 write requests per day
- Each user stores approximately 100 notes
- Each note averages approximately 2 KB of database storage
- Additional indexes and metadata add approximately 50% overhead

### Daily Reads

```text
200,000 active users × 50 reads
= 10,000,000 reads/day

Average reads per second:
10,000,000 / 86,400
≈ 116 reads/second

For capacity planning, assume peak traffic can be approximately 5 times the daily average:
116 × 5
≈ 580 reads/second

Therefore, the architecture should initially be designed to support approximately 600 reads/second during peak traffic.
```

### Daily Writes

```text
200,000 active users × 5 writes
= 1,000,000 writes/day

Average writes per second:
1,000,000 / 86,400
≈ 12 writes/second

With a 5× peak factor:
12 × 5
≈ 60 writes/second

Therefore, the system should initially support approximately 60 writes/second during peak traffic.
```

### Storage

```text
Assume each of the 1 million users stores 100 notes:
1,000,000 × 100
= 100,000,000 notes

At approximately 2 KB per note:
100,000,000 × 2 KB
≈ 200 GB

Adding approximately 50% for indexes, metadata, and database overhead:
200 GB × 1.5
≈ 300 GB

Therefore, the initial database storage requirement is approximately 300 GB.

If the service adds approximately 1,000,000 new notes per day:
1,000,000 × 365 × 2 KB
≈ 730 GB/year

With approximately 50% overhead:
730 GB × 1.5
≈ 1.1 TB/year

Therefore, a reasonable planning estimate is approximately 1.1 TB of additional database storage per year.
```

### Load Summary

| Metric | Estimate |
| --- | --- |
| Registered users | 1,000,000 |
| Daily active users | 200,000 |
| Average reads/second | ~116 |
| Peak reads/second | ~600 |
| Average writes/second | ~12 |
| Peak writes/second | ~60 |
| Estimated new storage/year | ~1.1 TB |

These estimates should be replaced with real production metrics after launch.

## 4. Architecture Diagram

```text
                         ┌─────────────────┐
                         │      Client     │
                         │ Web Browser     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │       DNS       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │       CDN       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Load Balancer   │
                         └───────┬─┬───────┘
                                 │ │
                    ┌────────────┘ └────────────┐
                    ▼                           ▼
           ┌─────────────────┐        ┌─────────────────┐
           │   App Server 1  │        │   App Server 2  │
           └────────┬────────┘        └────────┬────────┘
                    │                          │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
           ┌─────────────────┐       ┌─────────────────┐
           │      Cache      │       │  Primary DB     │
           │     Redis       │       │   PostgreSQL    │
           └─────────────────┘       └────────┬────────┘
                                              │
                                              │ Replication
                                              ▼
                                      ┌─────────────────┐
                                      │   Read Replica  │
                                      │   PostgreSQL    │
                                      └─────────────────┘

                    Write / Async Operations
                              │
                              ▼
                    ┌─────────────────┐
                    │      Queue      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Worker      │
                    └─────────────────┘
```

## 5. Component Responsibilities

### Client

The web browser provides the user interface and sends API requests to the backend.

### DNS

DNS translates the QuickNotes domain name into the address of the infrastructure serving the application.

### CDN

The CDN caches static frontend assets close to users, reducing latency and traffic reaching the application servers.

### Load Balancer

The load balancer distributes incoming API requests across multiple application servers and removes unhealthy servers from rotation.

### App Servers

Multiple application servers run the QuickNotes API and handle authentication, validation, business logic, and database operations.

### Cache

Redis caches frequently requested data such as note lists to reduce database load and improve response time.

### Primary Database

PostgreSQL stores the authoritative user, note, tag, and relationship data and handles writes.

### Read Replica

The read replica receives replicated database data and handles read-heavy queries without putting additional load on the primary database.

### Queue

The queue stores asynchronous jobs so slow background work does not block user-facing API requests.

### Worker

Workers consume jobs from the queue and perform background operations such as notifications, indexing, cleanup, and other tasks that do not need to happen during the user's request.

## 6. GET /notes Request Flow

When a user loads their notes:

1. The browser sends `GET /notes`.
2. DNS resolves the QuickNotes domain.
3. The request reaches the CDN.
4. If the requested resource is not a cacheable static asset, the CDN forwards the API request toward the load balancer.
5. The load balancer selects a healthy application server.
6. The application server authenticates the user and validates the request.
7. The application server checks Redis for a cached note list.
8. If the data is in the cache, the application server returns it without querying the database.
9. If the data is not cached, the application server sends the read query to the PostgreSQL read replica.
10. The read replica returns the user's notes.
11. The application server can store the result in Redis for future requests.
12. The application server returns the notes as JSON.
13. The browser displays the notes.

```text
Client
  ↓
DNS
  ↓
CDN
  ↓
Load Balancer
  ↓
App Server
  ↓
Cache ── hit ──→ Response
  │
  └── miss
       ↓
   Read Replica
       ↓
   App Server
       ↓
     Client
```

## 7. POST /notes Request Flow

When a user creates a note:

1. The browser sends `POST /notes` with the note title and body.
2. DNS resolves the QuickNotes domain.
3. The request reaches the load balancer.
4. The load balancer selects a healthy application server.
5. The application server authenticates the user.
6. The application server validates the title and body.
7. The application server sends the new note to the PostgreSQL primary database.
8. PostgreSQL stores the note and returns the new note ID.
9. The application server invalidates or updates the related Redis cache entry.
10. If additional background work is required, the application server places a job onto the queue.
11. The worker processes the background job asynchronously.
12. The application server returns `201 Created` and the new note to the browser.
13. The browser displays the new note.

```text
Client
  ↓
DNS
  ↓
Load Balancer
  ↓
App Server
  ↓
Primary Database
  ↓
App Server
  ├──→ Cache invalidation
  │
  └──→ Queue → Worker
  ↓
Client
```

## 8. Architectural Trade-Offs

### Trade-Off 1 — Cache vs Data Consistency

Caching frequently requested notes improves performance and reduces database load.

However, cached data can become stale after a note is created, updated, or deleted.

QuickNotes can reduce this problem by invalidating the affected cache entry whenever note data changes.

The trade-off is increased system complexity in exchange for better performance.

### Trade-Off 2 — Read Replica vs Simplicity

A read replica allows the system to handle many more read requests without putting all read traffic on the primary database.

However, replication introduces additional infrastructure and can cause a small delay between a write on the primary database and its appearance on the replica.

The system should route writes to the primary and use the replica for normal read traffic.

### Trade-Off 3 — Asynchronous Queue vs Immediate Processing

A queue allows expensive background work to happen outside the user's request.

This improves API response times and prevents slow background tasks from blocking users.

However, queues add operational complexity and require monitoring, retries, and failure handling.

## 9. Avoiding Single Points of Failure

The architecture avoids single points of failure by using redundancy at important layers.

### Application Servers

At least two application servers run behind the load balancer. If one fails, the load balancer sends traffic to the remaining healthy server.

### Load Balancer

The load-balancing layer should itself run as a highly available managed service or across multiple availability zones so one machine does not become a single point of failure.

### Database

The primary database should have automated backups and a standby/failover strategy. A read replica provides additional redundancy for read traffic.

### Cache

The application should treat Redis as a performance layer rather than the source of truth. If the cache fails, requests can fall back to the database.

### Queue

The queue should use a durable, replicated service so jobs are not lost if one queue node fails.

### Worker

Multiple worker instances should consume jobs from the queue. If one worker fails, another worker can process the job.

## 10. Scaling Strategy

As traffic grows, QuickNotes can scale horizontally.

### Application Layer

Add more application servers behind the load balancer.

### Cache Layer

Increase Redis capacity or use a Redis cluster when the cache workload becomes too large for one instance.

### Database Reads

Add additional read replicas when read traffic increases.

### Database Writes

Optimize indexes and queries first, then scale the primary database vertically. If the system eventually exceeds the capacity of a single primary database, database partitioning or sharding can be considered.

### Background Processing

Add more worker instances when the queue grows.

### Monitoring

The production system should monitor:

- Request rate
- Error rate
- API latency
- Database CPU and connections
- Cache hit rate
- Queue depth
- Worker failures
- Storage usage
