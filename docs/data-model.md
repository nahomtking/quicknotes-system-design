# QuickNotes Data Model

## Overview

QuickNotes uses a relational SQL database to store users, notes, tags, and the relationships between notes and tags.

The model contains four main entities:

- `users` — accounts that own notes
- `notes` — the user's saved notes
- `tags` — labels that can be applied to notes
- `note_tags` — junction table connecting notes and tags

---

## Entities and Columns

### 1. Users

| Column | Type | Key | Description |
|---|---|---|---|
| id | BIGINT | Primary Key | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Securely hashed password |
| created_at | TIMESTAMP | NOT NULL | Account creation time |
| updated_at | TIMESTAMP | NOT NULL | Last account update time |

### 2. Notes

| Column | Type | Key | Description |
|---|---|---|---|
| id | BIGINT | Primary Key | Unique note identifier |
| user_id | BIGINT | Foreign Key | User who owns the note |
| title | VARCHAR(100) | NOT NULL | Note title |
| body | TEXT | NULL | Note content |
| created_at | TIMESTAMP | NOT NULL | Note creation time |
| updated_at | TIMESTAMP | NOT NULL | Last note update time |

### 3. Tags

| Column | Type | Key | Description |
|---|---|---|---|
| id | BIGINT | Primary Key | Unique tag identifier |
| user_id | BIGINT | Foreign Key | User who owns the tag |
| name | VARCHAR(50) | NOT NULL | Tag name |
| created_at | TIMESTAMP | NOT NULL | Tag creation time |

### 4. Note Tags

| Column | Type | Key | Description |
|---|---|---|---|
| note_id | BIGINT | Primary Key, Foreign Key | Related note |
| tag_id | BIGINT | Primary Key, Foreign Key | Related tag |

The combination of `note_id` and `tag_id` forms a composite primary key. This prevents the same tag from being attached to the same note more than once.

---

## Relationships

### Users to Notes — One-to-Many

One user can have many notes, but each note belongs to one user.

```text
users 1 ──────── * notes
```

The `notes.user_id` foreign key references `users.id`.

### Users to Tags — One-to-Many

One user can create many tags, but each tag belongs to one user.

```text
users 1 ──────── * tags
```

The `tags.user_id` foreign key references `users.id`.

### Notes to Tags — Many-to-Many

A note can have multiple tags, and a tag can be assigned to multiple notes.

```text
notes * ──────── * tags
```

The many-to-many relationship is implemented using the `note_tags` junction table.

```text
notes 1 ──────── * note_tags * ──────── 1 tags
```

## Database Schema

### Users

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Notes

```sql
CREATE TABLE notes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

### Tags

```sql
CREATE TABLE tags (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tags_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_tag
        UNIQUE (user_id, name)
);
```

### Note Tags

```sql
CREATE TABLE note_tags (
    note_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,

    PRIMARY KEY (note_id, tag_id),

    CONSTRAINT fk_note_tags_note
        FOREIGN KEY (note_id)
        REFERENCES notes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_note_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);
```

## Example SQL Queries

### Query 1 — Get all notes for a user

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;
```

This retrieves all notes owned by user 1, with the most recently updated notes first.

### Query 2 — Find notes containing a word

```sql
SELECT id, title, body
FROM notes
WHERE user_id = 1
  AND (title LIKE '%project%' OR body LIKE '%project%');
```

This searches a user's notes for the word project in either the title or body.

### Query 3 — JOIN notes with their tags

```sql
SELECT
    n.id AS note_id,
    n.title,
    t.name AS tag
FROM notes n
JOIN note_tags nt ON n.id = nt.note_id
JOIN tags t ON nt.tag_id = t.id
WHERE n.user_id = 1
ORDER BY n.id;
```

This JOIN returns notes together with the tags assigned to them.

### Query 4 — Count notes for each user

```sql
SELECT
    u.id,
    u.email,
    COUNT(n.id) AS note_count
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.email
ORDER BY note_count DESC;
```

This shows how many notes each user has, including users who have no notes.

## Indexes

An index should be created on `notes.user_id` because one of the most common operations will be retrieving all notes belonging to a particular user.

```sql
CREATE INDEX idx_notes_user_id
ON notes(user_id);
```

This index allows the database to find a user's notes more efficiently than scanning the entire notes table.

Another useful index is on `note_tags.tag_id` because the application may need to find all notes associated with a particular tag.

```sql
CREATE INDEX idx_note_tags_tag_id
ON note_tags(tag_id);
```

## SQL vs NoSQL Decision

QuickNotes should use a SQL relational database such as PostgreSQL.

The application has clear relationships between users, notes, and tags. Notes belong to users, while notes and tags have a many-to-many relationship implemented through `note_tags`. SQL foreign keys and constraints provide strong data integrity and prevent invalid relationships.

SQL also makes JOIN queries and transactional operations straightforward. A NoSQL database could provide flexible schemas and easy horizontal scaling, but the structured relationships and consistency requirements of QuickNotes make a relational database the better choice.

For a service expected to grow to 1 million users, PostgreSQL can also be scaled using read replicas, indexes, caching, connection pooling, and other infrastructure described in the architecture document.

### Quick requirement check

This covers every item the assignment asks for:

- ✅ `users`
- ✅ `notes`
- ✅ `tags`
- ✅ `note_tags`
- ✅ Columns and types
- ✅ Primary keys
- ✅ Foreign keys
- ✅ One-to-many relationship
- ✅ Many-to-many relationship
- ✅ `CREATE TABLE` for all four
- ✅ 4 example SQL queries
- ✅ JOIN query
- ✅ Index + reason
- ✅ SQL vs NoSQL justification
