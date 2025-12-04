# Architecture & Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Web Browser (Client)                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │ │
│  │  │   HTML UI    │  │   CSS Styles │  │   Assets │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │ │
│  │                                                     │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │        JavaScript (script.js)                │ │ │
│  │  │  ├─ Session Management                       │ │ │
│  │  │  ├─ WebSocket Client                         │ │ │
│  │  │  ├─ Code Editor Handler                      │ │ │
│  │  │  ├─ Syntax Highlighting                      │ │ │
│  │  │  ├─ Code Execution                           │ │ │
│  │  │  └─ UI Event Listeners                       │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │                                                     │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │      Highlight.js Library (CDN)              │ │ │
│  │  │  └─ Syntax highlighting for 7+ languages     │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↕ WebSocket
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │        Express.js Server (server.js)               │ │
│  │                                                     │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  REST API Handler                            │ │ │
│  │  │  ├─ POST /api/session (Create)              │ │ │
│  │  │  └─ GET /api/session/:id (Get info)         │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │                                                     │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  WebSocket Server Handler                    │ │ │
│  │  │  ├─ Connection Management                    │ │ │
│  │  │  ├─ Message Routing                          │ │ │
│  │  │  ├─ Broadcasting                             │ │ │
│  │  │  └─ Error Handling                           │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │                                                     │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Session Management                          │ │ │
│  │  │  ├─ Create/Store sessions                    │ │ │
│  │  │  ├─ Track connected clients                  │ │ │
│  │  │  ├─ Manage code state                        │ │ │
│  │  │  └─ Cleanup on disconnect                    │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↕ In-Memory
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                            │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │   Session Storage (In-Memory Map)                  │ │
│  │                                                     │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Session {                                   │ │ │
│  │  │    id: "abc123",                             │ │ │
│  │  │    code: "...",                              │ │ │
│  │  │    language: "javascript",                   │ │ │
│  │  │    clients: Set[],                           │ │ │
│  │  │    createdAt: Date                           │ │ │
│  │  │  }                                            │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. Session Creation Flow

```
User Request
    ↓
POST /api/session
    ↓
Server: Generate UUID
    ↓
Server: Create Session object
    ↓
Server: Store in Sessions Map
    ↓
Response: { sessionId, url }
    ↓
Browser: Update URL with ?session=abc123
    ↓
Session Ready to Share
```

### 2. User Join Flow

```
User opens http://localhost:3000?session=abc123
    ↓
Browser: Extract sessionId from URL
    ↓
Browser: Connect WebSocket to ws://localhost:3000
    ↓
WebSocket: connection event
    ↓
Browser: Send { type: 'join', sessionId }
    ↓
Server: Lookup session
    ↓
Server: Add client to session.clients Set
    ↓
Server: Send init to joining client
    { type: 'init', code, language, clients, clientId }
    ↓
Server: Broadcast to others
    { type: 'userJoined', clients: 2 }
    ↓
Browser: Update UI with code and user count
```

### 3. Code Change Flow

```
User types in editor
    ↓
Event: input on textarea
    ↓
Handler: updateHighlight() (immediate)
    ↓
Handler: setTimeout 300ms
    ↓
300ms passes...
    ↓
Handler: sendCodeChange(code)
    ↓
Browser: Send WebSocket message
    { type: 'codeChange', code: "..." }
    ↓
Server: Receive message
    ↓
Server: Update session.code
    ↓
Server: Broadcast to all OTHER clients
    { type: 'codeUpdate', code: "..." }
    ↓
Other Browsers: Receive codeUpdate
    ↓
Other Browsers: Update editor value
    ↓
Other Browsers: Update highlight
    ↓
Other Browsers: User sees code (300ms after typing)
```

### 4. Code Execution Flow

```
User clicks "Execute" button
    ↓
Button: click event
    ↓
Handler: executeCode(code, language)
    ↓
Browser: Try Function() with strict mode
    ↓
Browser: Capture console.log output
    ↓
Display: Show output in output panel
    ↓
Handler: sendCodeExecution(code, language)
    ↓
Browser: Send WebSocket message
    { type: 'executeCode', code, language }
    ↓
Server: Broadcast to all clients
    { type: 'executeCode', code, language }
    ↓
Other Browsers: executeCode() called
    ↓
Other Browsers: Code executed locally
    ↓
Other Browsers: Same output shown
```

---

## WebSocket Message Sequence Diagram

```
Browser 1              Server              Browser 2
   |                     |                     |
   |---- WebSocket Connect -------------------|
   |                     |                     |
   |---- join session ---|                     |
   |                     |---- init ----------->|
   |                     |                     |
   |                 +-- init + codeUpdate ----|
   |                 |   to Browser 2          |
   |                 |                         |
   |                     |                     |
   |--- codeChange ------|                     |
   | (User types)        |--- broadcast ------>|
   |                     |                     |
   |                     |<-- codeUpdate ------|
   |                     | (if Browser 2 types)|
   |                     |                     |
   |--- executeCode -----|                     |
   |                     |--- broadcast ------>|
   |                     |                     |
   |                     |<-- userLeft --------|
   | (Browser 2 closes)  |                     |
   |                     |                     |
```

---

## File Structure Tree

```
zoomcamp-02/
├── .git/                    # Git repository
│
├── backend/                 # Node.js/Express Backend
│   ├── server.js
│   │   ├── Express app setup
│   │   ├── HTTP server on port 3000
│   │   ├── WebSocket server (wss)
│   │   ├── Session class definition
│   │   ├── REST endpoints
│   │   │   ├── POST /api/session
│   │   │   └── GET /api/session/:id
│   │   ├── WebSocket handlers
│   │   │   ├── connection
│   │   │   ├── message (join, codeChange, etc.)
│   │   │   ├── close
│   │   │   └── error
│   │   └── Session storage (Map)
│   │
│   └── package.json
│       ├── express: ^4.18.2
│       ├── ws: ^8.14.2
│       ├── cors: ^2.8.5
│       └── uuid: ^9.0.0
│
├── frontend/                # Web Application
│   ├── index.html
│   │   ├── Doctype & Meta tags
│   │   ├── Header section
│   │   │   ├── Session info display
│   │   │   ├── Copy link button
│   │   │   └── User count
│   │   ├── Main content
│   │   │   ├── Editor section
│   │   │   │   ├── Language selector
│   │   │   │   ├── Execute button
│   │   │   │   └── Code editor + highlighter
│   │   │   └── Output section
│   │   │       ├── Clear button
│   │   │       └── Output display
│   │   ├── Footer
│   │   ├── Notification div
│   │   └── Script imports
│   │       ├── Highlight.js (CDN)
│   │       └── script.js
│   │
│   ├── styles.css
│   │   ├── Global styles (*, body, .container)
│   │   ├── Header styles
│   │   ├── Main content layout
│   │   ├── Editor section (textarea + pre)
│   │   ├── Output section
│   │   ├── Button styles
│   │   ├── Notification styles
│   │   ├── Scrollbar customization
│   │   └── Media queries (responsive)
│   │
│   └── script.js
│       ├── Global variables
│       ├── initializeSession()
│       ├── connectWebSocket()
│       ├── handleMessage()
│       ├── updateHighlight()
│       ├── executeCode()
│       ├── executeJavaScript()
│       ├── Event listeners
│       │   ├── input (debounced)
│       │   ├── language change
│       │   ├── execute click
│       │   └── copy link click
│       └── UI update functions
│
├── Documentation/
│   ├── README.md              # Main project overview
│   ├── QUICKSTART.md          # 30-second setup
│   ├── SETUP.md               # Detailed installation
│   ├── API.md                 # API documentation
│   ├── FEATURES.md            # Feature examples
│   ├── TESTING.md             # Testing guide
│   ├── IMPLEMENTATION.md      # Technical details
│   ├── PROJECT_COMPLETE.md    # Final summary
│   └── ARCHITECTURE.md        # This file
│
└── Startup Scripts/
    ├── start.sh               # Linux/Mac startup
    └── start.bat              # Windows startup
```

---

## Session Lifecycle

```
Created: new Session(id)
├─ Properties initialized
│  ├─ id: unique UUID
│  ├─ code: empty string
│  ├─ language: 'javascript'
│  ├─ clients: new Set()
│  └─ createdAt: now
│
Active: Users connect
├─ First user joins
│  ├─ addClient(ws) → clients = {ws1}
│  └─ Init sent to ws1
│
├─ Second user joins
│  ├─ addClient(ws) → clients = {ws1, ws2}
│  ├─ Init sent to ws2
│  └─ userJoined notification
│
├─ Code synchronization
│  ├─ ws1 sends codeChange
│  ├─ session.code updated
│  └─ broadcast to ws2
│
Idle: Users disconnect
├─ First user leaves
│  ├─ removeClient(ws1) → clients = {ws2}
│  └─ userLeft notification
│
├─ Second user leaves
│  ├─ removeClient(ws2) → clients = {}
│  ├─ sessions.delete(id)
│  └─ Memory released
│
Destroyed: Session garbage collected
```

---

## Real-time Sync Algorithm

```
User Types:
  Code = "console.log('hello')"
  Local Highlight Update = Instant
  
300ms Debounce Timer:
  ├─ Timer set on first keystroke
  ├─ Reset on each new keystroke
  └─ Expires after 300ms of inactivity
  
Send Message:
  ├─ { type: 'codeChange', code: ... }
  ├─ Sent via WebSocket
  └─ Network latency: <50ms (local)
  
Server Processing:
  ├─ Parse message
  ├─ Update session.code
  ├─ Broadcast to other clients
  └─ <10ms server processing
  
Client Receive:
  ├─ Receive codeUpdate message
  ├─ Update textarea value
  ├─ Preserve scroll position
  ├─ Update highlighting
  └─ User sees change

Total Latency = 300ms (debounce) + <100ms (network/server)
              = ~300-400ms visible delay
```

---

## Error Handling Flow

```
Error Occurs:
├─ WebSocket disconnection
│  ├─ ws.onclose triggered
│  ├─ isConnected = false
│  └─ attemptReconnect()
│     ├─ If attempts < 5
│     │  ├─ Wait 2000ms
│     │  └─ Call connectWebSocket()
│     └─ Else
│        └─ Show error notification
│
├─ Invalid session
│  ├─ Server sends error message
│  ├─ WebSocket closes
│  └─ User sees error
│
├─ Code execution error
│  ├─ Try/catch block
│  ├─ Error logged to output
│  ├─ Displayed in red
│  └─ User can fix and retry
│
└─ Network error
   ├─ WebSocket error event
   ├─ Auto-reconnect triggered
   └─ Transparent to user
```

---

## Performance Optimization

```
Browser-side Optimizations:
├─ Debouncing (300ms)
│  └─ Reduces network messages
├─ Syntax highlighting (overlay)
│  └─ No rendering lag
├─ Scroll sync
│  └─ Single event handler
└─ Code execution sandbox
   └─ No blocking operations

Server-side Optimizations:
├─ In-memory storage
│  └─ Fast reads/writes
├─ Set for clients
│  └─ O(1) add/remove
├─ Broadcast to subset
│  └─ Skip sender
└─ Session cleanup
   └─ Free memory on disconnect
```

---

## Scalability Considerations

```
Current (Single Server):
├─ Sessions: In-memory Map
├─ Max users per session: 100+
├─ Max concurrent sessions: Limited by memory
├─ Max server instances: 1

Future (Distributed):
├─ Sessions: Redis store
├─ Max users per session: Unlimited
├─ Max concurrent sessions: Unlimited
├─ Max server instances: N
├─ Load balancer: Nginx/HAProxy
├─ Database: PostgreSQL/MongoDB
└─ Message broker: RabbitMQ/Kafka
```

---

**All diagrams and architecture documented!** ✨
