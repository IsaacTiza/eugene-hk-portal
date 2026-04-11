 HK Portal API

A full-featured dating platform REST API built with Node.js, Express, and MongoDB. Supports user authentication, profile management, matchmaking, real-time chat, push notifications, and more.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Health](#health)
  - [Authentication & Users](#authentication--users)
  - [Profile](#profile)
  - [Matching](#matching)
  - [Messages](#messages)
  - [Admin](#admin)
- [Socket.io Events](#socketio-events)
- [Error Handling](#error-handling)

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT + httpOnly Cookies
- **File Upload**: Multer
- **Email**: Resend
- **Push Notifications**: Firebase Cloud Messaging
- **Security**: Helmet, CORS, Mongo Sanitize, Rate Limiting

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/IsaacTiza/eugene-hk-portal.git

# Install dependencies
cd eugene-hk-portal
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

---

## Base URL

```
http://localhost:5000/hk-portal/v1
```

---

## Authentication

The API uses **httpOnly cookies** for web authentication. On login, a `jwt` cookie is automatically set and sent with every subsequent request.

For programmatic access (e.g. Postman), pass the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Protected routes require a valid JWT. Admin routes additionally require `role: "admin"`.

---

## API Endpoints

---

### Health

#### Check API Health
```
GET /health
```
**Auth required**: No

**Response**:
```json
{
  "status": "success",
  "message": "WELCOME TO EUGENE HK-PORTAL API is healthy"
}
```

---

#### Ping Test
```
POST /health
```
**Auth required**: No

**Body**:
```json
{ "message": "ping" }
```

**Response**:
```json
{ "status": "success", "message": "pong" }
```

---

### Authentication & Users

#### Register
```
POST /register
```
**Auth required**: No  
**Rate limited**: 10 requests per 15 minutes

**Body**:
```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "gender": "male",
  "age": 25,
  "bio": "About me",
  "occupation": "Engineer",
  "number": "+2348012345678",
  "interests": ["tech", "music"],
  "hobbies": ["gaming", "cooking"],
  "location": {
    "type": "Point",
    "coordinates": [3.3792, 6.5244],
    "city": "Lagos",
    "country": "Nigeria"
  },
  "matchPreferences": {
    "interestedIn": "female",
    "ageRange": { "min": 20, "max": 30 },
    "maxDistance": 50,
    "hobbies": ["cooking"],
    "interests": ["music"]
  }
}
```

**Notes**: A verification email is sent after registration. The user must verify their email before logging in.

---

#### Verify Email
```
GET /verify-email/:token
```
**Auth required**: No

**Notes**: Token is sent to the user's email on registration. Expires in 24 hours.

---

#### Login
```
POST /login
```
**Auth required**: No  
**Rate limited**: 10 requests per 15 minutes

**Body**:
```json
{
  "email": "johndoe@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "...",
      "username": "Johndoe",
      "email": "johndoe@example.com",
      "role": "user"
    }
  }
}
```

**Notes**: Sets a `jwt` httpOnly cookie automatically.

---

#### Logout
```
POST /logout
```
**Auth required**: No

**Notes**: Clears the `jwt` cookie.

---

#### Forgot Password
```
POST /forgot-password
```
**Auth required**: No  
**Rate limited**: 10 requests per 15 minutes

**Body**:
```json
{ "email": "johndoe@example.com" }
```

---

#### Reset Password
```
POST /reset-password/:token
```
**Auth required**: No  
**Rate limited**: 10 requests per 15 minutes

**Body**:
```json
{
  "password": "newpassword123",
  "passwordConfirm": "newpassword123"
}
```

---

#### Update Password
```
POST /me/update-password
```
**Auth required**: Yes

**Body**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "newPasswordConfirm": "newpassword123"
}
```

---

#### Update FCM Token
```
PATCH /me/fcm-token
```
**Auth required**: Yes

**Body**:
```json
{ "fcmToken": "firebase_device_token" }
```

**Notes**: Call this endpoint when the user logs in on a new device to enable push notifications.

---

### Profile

#### Get My Profile
```
GET /me
```
**Auth required**: Yes

**Response**: Full user profile including all fields except sensitive auth data.

---

#### Update My Profile
```
PATCH /me
```
**Auth required**: Yes

**Body** (all fields optional):
```json
{
  "bio": "Updated bio",
  "age": 26,
  "occupation": "Designer",
  "number": "+2348098765432",
  "interests": ["art", "travel"],
  "hobbies": ["photography", "swimming"],
  "location": {
    "type": "Point",
    "coordinates": [3.3792, 6.5244],
    "city": "Lagos",
    "country": "Nigeria"
  },
  "matchPreferences": {
    "interestedIn": "female",
    "ageRange": { "min": 18, "max": 28 },
    "maxDistance": 30,
    "hobbies": ["swimming"],
    "interests": ["travel"]
  }
}
```

**Notes**: `email` and `username` cannot be updated through this endpoint.

---

#### Upload Profile Picture
```
PATCH /me/profile-picture
```
**Auth required**: Yes  
**Content-Type**: `multipart/form-data`

**Body**:
```
Key: profilePicture
Value: <image file> (max 2MB, images only)
```

---

#### Delete My Account
```
DELETE /me
```
**Auth required**: Yes

**Notes**: Soft deletes the account. Account is deactivated but data is retained.

---

#### Get Other User's Profile
```
GET /:slug
```
**Auth required**: Yes

**Notes**: Returns public profile fields only. Sensitive data like email, phone, and location coordinates are excluded.

---

#### Search Users
```
GET /search?q=:query
```
**Auth required**: Yes

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search term (required) |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 10) |
| sort | string | Sort field (default: createdAt) |

**Notes**: Searches across username, bio, occupation, interests, hobbies, and city. Returns public fields only. Excludes the logged-in user from results.

**Example**:
```
GET /search?q=lagos&page=1&limit=10
```

---

### Matching

#### Swipe on a User
```
POST /match/like/:slug
```
**Auth required**: Yes  
**Rate limited**: 100 swipes per hour

**Body**:
```json
{ "action": "like" }
```
or
```json
{ "action": "pass" }
```

**Response**:
```json
{
  "status": "success",
  "matched": true,
  "data": {
    "message": "It's a match!"
  }
}
```

**Notes**: When two users mutually like each other, a match is automatically created and `matched: true` is returned.

---

#### Get My Matches
```
GET /match/matches
```
**Auth required**: Yes

**Response**: List of all active matches with the other user's public profile populated.

---

#### Unmatch a User
```
PATCH /match/unmatch/:slug
```
**Auth required**: Yes

**Notes**: Sets the match to inactive. Records who unmatched and when.

---

#### Discovery Feed
```
GET /match/discover
```
**Auth required**: Yes

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 10) |

**Notes**: Returns users matching the logged-in user's `matchPreferences` (gender, age range, distance). Excludes users already swiped on. If location is not set, distance filtering is skipped.

---

### Messages

#### Get Unread Message Count
```
GET /message/unread
```
**Auth required**: Yes

**Response**:
```json
{
  "status": "success",
  "data": {
    "unread": [
      { "matchId": "...", "newMessages": 3 }
    ]
  }
}
```

---

#### Get Conversation History
```
GET /message/:matchId/messages
```
**Auth required**: Yes

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Messages per page (default: 10) |
| sort | string | Sort field (default: createdAt oldest first) |

**Notes**: Only users who are part of the match can access the conversation. Deleted messages are excluded.

---

### Admin

All admin routes require authentication and `role: "admin"`.  
Base path: `/hk-portal/v1/admin`

#### Get All Users
```
GET /admin/users
```

#### Get User by Slug
```
GET /admin/users/:slug
```

#### Register User
```
POST /admin/users
```
**Body**: Same as register endpoint.

#### Update User Profile
```
PATCH /admin/users/:slug
```

#### Soft Delete User
```
DELETE /admin/users/:slug/soft
```

#### Hard Delete User
```
DELETE /admin/users/:slug/hard
```

**Notes**: Permanently removes the user from the database. Irreversible.

#### Reset User Password
```
POST /admin/users/reset-password/:slug
```
**Body**:
```json
{
  "newPassword": "newpassword123",
  "newPasswordConfirm": "newpassword123"
}
```

---

## Socket.io Events

The API uses Socket.io for real-time chat. Connect with JWT authentication:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  query: { token: "your_jwt_token" }
});
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `matchId: string` | Join a match's chat room |
| `send_message` | `{ matchId, receiverId, content, type }` | Send a message |
| `mark_read` | `matchId: string` | Mark all messages in a room as read |
| `delete_message` | `messageId: string` | Soft delete a message |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `joined_room` | `{ matchId }` | Confirmed room join |
| `receive_message` | `{ _id, sender, content, type, isRead, createdAt }` | New message received |
| `messages_read` | `{ matchId, readBy }` | Messages were read by the other user |
| `message_deleted` | `{ messageId }` | A message was deleted |
| `error` | `{ message }` | Error occurred |

### Message Types

| Type | Description |
|------|-------------|
| `text` | Plain text message |
| `image` | Image URL |

---

## Error Handling

All errors follow this format:

```json
{
  "status": "error",
  "message": "Error description here",
  "errors": null
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Rate Limiting

| Route | Limit |
|-------|-------|
| Auth routes (login, register, forgot password, reset password) | 10 requests per 15 minutes |
| Swipe endpoint | 100 swipes per hour |
| All other routes | 100 requests per 15 minutes |

---

## Notes for Frontend Developers

- Always send requests with `credentials: "include"` to ensure cookies are sent cross-origin
- The `jwt` cookie is httpOnly — do not attempt to read it via JavaScript
- For Socket.io, pass the JWT token as a query parameter on connection
- Profile picture uploads must use `multipart/form-data` with key `profilePicture`
- All paginated endpoints accept `page` and `limit` query parameters
- Location coordinates are in `[longitude, latitude]` format (GeoJSON standard)
