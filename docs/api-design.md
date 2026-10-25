# QuickNotes API Design

## Overview

The QuickNotes API is a RESTful HTTP API that allows users to create, read, update, and delete notes. Notes can also be organized with tags.

The API uses JSON for request and response bodies.

Base URL:

`https://api.quicknotes.example.com/v1`

## Authentication

Authenticated endpoints use a bearer token in the `Authorization` header.

Example:

```http
Authorization: ******
```

## REST Endpoints

| Method | Path | Description | Success Status |
| --- | --- | --- | --- |
| POST | /auth/login | Authenticate a user and return an access token | 200 OK |
| GET | /notes | List notes belonging to the authenticated user | 200 OK |
| GET | /notes/{id} | Get one note by ID | 200 OK |
| POST | /notes | Create a new note | 201 Created |
| PUT | /notes/{id} | Replace an existing note | 200 OK |
| DELETE | /notes/{id} | Delete an existing note | 204 No Content |
| GET | /tags | List tags belonging to the authenticated user | 200 OK |
| POST | /tags | Create a new tag | 201 Created |

### 1. Login

`POST /auth/login`

Authenticates a user and returns an access token.

#### Request

```json
{
  "email": "nahom@example.com",
  "password": "example-password"
}
```

#### Response

`200 OK`

```json
{
  "token": "******",
  "user": {
    "id": 1,
    "email": "nahom@example.com"
  }
}
```

### 2. List Notes

`GET /notes`

Returns notes belonging to the authenticated user.

Optional query parameters can be used for pagination.

Example:

`GET /notes?page=1&limit=20`

#### Response

`200 OK`

```json
{
  "notes": [
    {
      "id": 101,
      "userId": 1,
      "title": "Project ideas",
      "body": "Ideas for the next QuickNotes project.",
      "createdAt": "2026-10-25T10:30:00Z",
      "updatedAt": "2026-10-25T10:30:00Z"
    },
    {
      "id": 102,
      "userId": 1,
      "title": "Meeting notes",
      "body": "Discuss the project requirements.",
      "createdAt": "2026-10-25T11:00:00Z",
      "updatedAt": "2026-10-25T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2
  }
}
```

### 3. Get One Note

`GET /notes/{id}`

Returns a single note by its ID.

#### Response

`200 OK`

```json
{
  "id": 101,
  "userId": 1,
  "title": "Project ideas",
  "body": "Ideas for the next QuickNotes project.",
  "createdAt": "2026-10-25T10:30:00Z",
  "updatedAt": "2026-10-25T10:30:00Z"
}
```

### 4. Create a Note

`POST /notes`

Creates a new note for the authenticated user.

#### Request

```json
{
  "title": "My new note",
  "body": "This is the content of my new note."
}
```

#### Response

`201 Created`

```json
{
  "id": 103,
  "userId": 1,
  "title": "My new note",
  "body": "This is the content of my new note.",
  "createdAt": "2026-10-25T12:00:00Z",
  "updatedAt": "2026-10-25T12:00:00Z"
}
```

### 5. Update a Note

`PUT /notes/{id}`

Replaces an existing note.

#### Request

```json
{
  "title": "Updated note title",
  "body": "Updated note content."
}
```

#### Response

`200 OK`

```json
{
  "id": 103,
  "userId": 1,
  "title": "Updated note title",
  "body": "Updated note content.",
  "createdAt": "2026-10-25T12:00:00Z",
  "updatedAt": "2026-10-25T12:30:00Z"
}
```

### 6. Delete a Note

`DELETE /notes/{id}`

Deletes a note belonging to the authenticated user.

#### Response

`204 No Content`

The server returns no response body when deletion succeeds.

### 7. List Tags

`GET /tags`

Returns all tags belonging to the authenticated user.

#### Response

`200 OK`

```json
{
  "tags": [
    {
      "id": 1,
      "name": "work"
    },
    {
      "id": 2,
      "name": "personal"
    }
  ]
}
```

### 8. Create a Tag

`POST /tags`

Creates a new tag.

#### Request

```json
{
  "name": "important"
}
```

#### Response

`201 Created`

```json
{
  "id": 3,
  "name": "important"
}
```

## Error Responses

The API uses standard HTTP status codes to communicate errors.

### 400 Bad Request

The request is invalid or required data is missing.

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required."
  }
}
```

### 401 Unauthorized

The request does not contain valid authentication credentials.

Example:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}
```

### 403 Forbidden

The user is authenticated but does not have permission to perform the requested action.

Example:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this note."
  }
}
```

### 404 Not Found

The requested resource does not exist.

Example:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Note not found."
  }
}
```

### 500 Internal Server Error

An unexpected error occurred on the server.

Example:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected server error occurred."
  }
}
```

## API Design Principles

The QuickNotes API uses REST conventions:

- Resources are represented by nouns such as /notes and /tags.
- HTTP methods describe the requested operation.
- JSON is used for structured request and response data.
- HTTP status codes communicate the result of each request.
- Authentication is required for user-specific resources.
- Users can only access notes that belong to their account.
