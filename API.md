## API Documentation

### REST Endpoints

#### Create New Session
```http
POST /api/session
Content-Type: application/json

Response (200):
{
  "sessionId": "a1b2c3d4",
  "url": "http://localhost:3000?session=a1b2c3d4"
}
```

#### Get Session Info
```http
GET /api/session/:id

Response (200):
{
  "sessionId": "a1b2c3d4",
  "code": "console.log('hello');",
  "language": "javascript",
  "clients": 2
}

Response (404):
{
  "error": "Session not found"
}
```

---

### WebSocket Events

#### Client → Server Events

##### `join` - Connect to Session
```json
{
  "type": "join",
  "sessionId": "a1b2c3d4"
}
```

##### `codeChange` - Update Code
```json
{
  "type": "codeChange",
  "code": "const x = 5; console.log(x);"
}
```

##### `languageChange` - Change Language
```json
{
  "type": "languageChange",
  "language": "python"
}
```

##### `cursorMove` - Update Cursor Position
```json
{
  "type": "cursorMove",
  "line": 5,
  "column": 10
}
```

##### `executeCode` - Execute Code
```json
{
  "type": "executeCode",
  "code": "console.log('test');",
  "language": "javascript"
}
```

---

#### Server → Client Events

##### `init` - Initialize Connection
```json
{
  "type": "init",
  "code": "// existing code",
  "language": "javascript",
  "clients": 2,
  "clientId": "user123"
}
```

##### `codeUpdate` - Code Changed by Other User
```json
{
  "type": "codeUpdate",
  "code": "const x = 5;",
  "clientId": "user456"
}
```

##### `languageUpdate` - Language Changed
```json
{
  "type": "languageUpdate",
  "language": "python"
}
```

##### `cursorUpdate` - Cursor Position Updated
```json
{
  "type": "cursorUpdate",
  "clientId": "user456",
  "line": 3,
  "column": 8
}
```

##### `userJoined` - New User Connected
```json
{
  "type": "userJoined",
  "clients": 3
}
```

##### `userLeft` - User Disconnected
```json
{
  "type": "userLeft",
  "clients": 2
}
```

##### `executeCode` - Code Executed
```json
{
  "type": "executeCode",
  "code": "const result = 10 + 5;",
  "language": "javascript"
}
```

##### `error` - Error Message
```json
{
  "type": "error",
  "message": "Session not found"
}
```

---

### Supported Languages for Syntax Highlighting

| Language | Highlight.js Alias |
|----------|-------------------|
| JavaScript | `javascript` |
| Python | `python` |
| Java | `java` |
| C++ | `cpp` |
| HTML | `html` |
| CSS | `css` |
| SQL | `sql` |

---

### Session Structure

```javascript
{
  id: "a1b2c3d4",           // Unique session identifier
  code: "...",              // Current code in editor
  language: "javascript",   // Selected language
  clients: Set(),           // Connected WebSocket clients
  createdAt: Date()         // Session creation timestamp
}
```

---

### Error Handling

All WebSocket errors are handled gracefully:
- Malformed JSON messages are logged and ignored
- Closed connections trigger reconnection logic
- Invalid session IDs receive error message and connection closes

---

### Rate Limiting Recommendations

For production deployment:
- Code changes: Debounce to 300ms client-side (already implemented)
- Connection limit: 100 clients per session
- Message size: Limit to 1MB per message
- Requests per minute: Implement per-IP limits

---

### Authentication Flow (Recommended for Production)

```
1. User provides interview code/token
2. Server validates token
3. Server returns session URL with JWT
4. Subsequent requests validate JWT
5. Session expires after set time (e.g., 2 hours)
```

---

### CORS Configuration

Current setup allows requests from:
- Same-origin requests
- Cross-origin requests from any domain

For production, restrict to known domains:
```javascript
const corsOptions = {
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true
};
```
