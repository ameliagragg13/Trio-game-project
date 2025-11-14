# Postman API Testing Guide

This guide will help you test the Trio Games API using Postman.

## Prerequisites

1. **Start the backend server:**
   ```bash
   npm run server
   ```
   The server will run on `http://localhost:3000`

2. **Install Postman** (if you haven't already)
   - Download from: https://www.postman.com/downloads/

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

## 1. Sign Up (Create Account)

**Endpoint:** `POST /api/auth/signup`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "testuser",
  "password": "test123"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "username": "testuser",
    "id": "1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token** from the response - you'll need it for other requests!

---

## 2. Login

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "testuser",
  "password": "test123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "username": "testuser",
    "id": "1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <your-token>
```

**Response (200 OK):**
```json
{
  "user": {
    "username": "testuser",
    "id": "1234567890"
  }
}
```

---

## 4. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <your-token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 5. Get Game Stats

**Endpoint:** `GET /api/games/stats`

**Headers:**
```
Authorization: Bearer <your-token>
```

**Response (200 OK):**
```json
{
  "memory": 5,
  "tictactoe": 3,
  "sudoku": 2
}
```

---

## 6. Increment Game Win

**Endpoint:** `POST /api/games/stats/increment`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Body (JSON):**
```json
{
  "gameName": "memory"
}
```

**Valid game names:** `"memory"`, `"tictactoe"`, `"sudoku"`

**Response (200 OK):**
```json
{
  "memory": 6,
  "tictactoe": 3,
  "sudoku": 2
}
```

---

## 7. Reset Game Stats

**Endpoint:** `POST /api/games/stats/reset`

**Headers:**
```
Authorization: Bearer <your-token>
```

**Response (200 OK):**
```json
{
  "message": "Stats reset successfully"
}
```

---

## Postman Collection Setup

### Quick Setup Steps:

1. **Create a new Collection** in Postman called "Trio Games API"

2. **Set Collection Variables:**
   - Go to Collection → Variables
   - Add variable: `baseUrl` = `http://localhost:3000/api`
   - Add variable: `token` = (leave empty, will be set after login)

3. **Create Requests:**
   - Use `{{baseUrl}}/auth/signup` instead of full URL
   - Use `{{token}}` in Authorization header

4. **Auto-save Token:**
   - In the Login request, add a Test script:
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       pm.collectionVariables.set("token", jsonData.token);
   }
   ```

### Example Request Setup:

**Sign Up Request:**
- Method: POST
- URL: `{{baseUrl}}/auth/signup`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "username": "testuser",
    "password": "test123"
  }
  ```

**Get Stats Request:**
- Method: GET
- URL: `{{baseUrl}}/games/stats`
- Headers: 
  - `Authorization: Bearer {{token}}`

---

## Testing Workflow

1. **Sign up** a new user → Save the token
2. **Login** with credentials → Verify token works
3. **Get stats** → Should return all zeros initially
4. **Increment a game win** → Check stats update
5. **Get stats again** → Verify the increment worked
6. **Reset stats** → All should go back to zero

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Username and password required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid token"
}
```

---

## Tips

- Tokens expire after 7 days
- Each user has their own stats
- The server stores data in `server/data/` directory
- Make sure the server is running before testing!

