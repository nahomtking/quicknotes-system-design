# QuickNotes System Design

A browser-based notes application demonstrating REST API usage, CRUD operations, database design, and scalable web architecture.

## What This Project Does

QuickNotes allows users to:

- Load notes from a REST API
- Create new notes
- Delete notes
- Display loading, success, error, and empty states
- Validate note titles before submission

The browser client uses the JSONPlaceholder API for demonstration.

## How to Run the API Client

1. Open the project folder in VS Code.
2. Open `index.html` in your browser.
3. Click **Load Notes** to retrieve notes from the API.
4. Use the form to create a note.
5. Use the **Delete** button to remove a note.

API endpoint: https://jsonplaceholder.typicode.com/posts

**Note:** JSONPlaceholder simulates REST API operations. Created and deleted posts are not permanently stored on the server.

## Documentation

- [API Design](docs/api-design.md) — REST endpoints, request/response formats, and error handling.
- [Data Model](docs/data-model.md) — database tables, relationships, SQL schema, queries, and database choice.
- [Architecture](docs/architecture.md) — scalable architecture, load estimates, request flows, trade-offs, and scaling strategy.

## What I Learned

- How to use the Fetch API with asynchronous JavaScript and handle successful and failed HTTP requests.
- How REST APIs use HTTP methods such as GET, POST, and DELETE.
- How to design relational database tables using primary keys, foreign keys, relationships, and indexes.
- How load balancers, multiple application servers, caching, read replicas, queues, and workers support scalable applications.
- How architectural trade-offs affect performance, consistency, reliability, and complexity.

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── api.js
├── style.css
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```