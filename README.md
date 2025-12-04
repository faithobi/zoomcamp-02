# Online Coding Interview Platform

A modern, real-time collaborative coding platform designed for conducting technical interviews. Interviewers and candidates can write, edit, and execute code together in real-time with full synchronization.

## 🎯 Project Overview

This application enables smooth technical interviews through a web-based collaborative code editor. It combines a Node.js/Express backend with a JavaScript frontend to provide:

- **Live Code Collaboration** - Multiple users editing the same code simultaneously
- **Real-time Synchronization** - Changes propagate instantly to all connected users
- **Multi-language Support** - Syntax highlighting for 7+ programming languages
- **Browser-based Execution** - Run JavaScript code with console output capture
- **Session Management** - Generate unique URLs for each interview session

## 📋 Directory Structure

```
zoomcamp-02/
├── backend/                 # Node.js server
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Express + WebSocket server
│   └── [node_modules/]     # Dependencies (after npm install)
├── frontend/               # Web application
│   ├── index.html          # HTML structure
│   ├── styles.css          # Styling
│   ├── script.js           # Client logic
│   └── [assets]            # CSS frameworks & libraries
├── SETUP.md               # Detailed setup guide
└── README.md              # This file
```

## ⚡ Quick Start

### 1. Install Dependencies

```powershell
cd backend
npm install
```

### 2. Start the Server

```powershell
npm start
```

Server will run on `http://localhost:3000`

### 3. Open in Browser

- **Interviewer**: Visit `http://localhost:3000` to create a session
- **Candidates**: Use the shared link to join

## 🧪 Testing

### Run Integration Tests

Integration tests verify that the client and server interactions work correctly, including session management, real-time synchronization, WebSocket communication, and error handling.

**Prerequisites:** Server must not be running on port 3000

```powershell
cd backend
npm test
```

This runs comprehensive integration tests covering:
- ✅ Session creation and retrieval
- ✅ WebSocket connection and messaging
- ✅ Code synchronization between clients
- ✅ Language changes broadcast
- ✅ User join/leave notifications
- ✅ Code execution broadcasts
- ✅ Error handling

### Expected Test Output

```
🧪 STARTING INTEGRATION TESTS
================================

Starting server...
✓ Server started successfully

📋 Testing Session Creation
  ✓ POST /api/session creates a new session
  ✓ Session ID is unique for each request
  ✓ Session URL contains session parameter

🔍 Testing Session Retrieval
  ✓ GET /api/session/:id returns session info
  ✓ GET /api/session/:id returns 404 for non-existent session
  ✓ Session contains correct initial data

... [more tests] ...

📊 Test Results:
   Passed: 20
   Failed: 0
   Total: 20

✅ All tests passed!
```

## 🚀 Running the Application

### Option 1: Direct Start (Windows)

```powershell
cd backend
npm install  # First time only
npm start
```

Then open `http://localhost:3000` in your browser.

### Option 2: Using Startup Script (Windows)

```powershell
.\start.bat
```

This script will:
1. Check if Node.js is installed
2. Install dependencies if needed
3. Start the server
4. Display connection information

### Option 3: Using Startup Script (Linux/Mac)

```bash
./start.sh
```

### Option 4: Development Mode

```powershell
cd backend
npm run dev
```

## 🛠️ Development Commands

### Backend Development

```powershell
cd backend

# Install dependencies
npm install

# Start server
npm start

# Run integration tests
npm test

# Run tests with aliases
npm run test:integration
```

### Frontend Development

Frontend files are automatically served by the Express server. To modify:

1. Edit `frontend/index.html` for structure
2. Edit `frontend/styles.css` for styling
3. Edit `frontend/script.js` for client logic
4. Refresh browser to see changes (no build required)

## 📋 Complete Command Reference

### Setup & Installation

| Command | Description |
|---------|-------------|
| `npm install` | Install backend dependencies |
| `npm update` | Update dependencies to latest |

### Running

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm run dev` | Start in development mode |
| `node server.js` | Direct server startup |

### Testing

| Command | Description |
|---------|-------------|
| `npm test` | Run all integration tests |
| `npm run test:integration` | Explicit test runner |

### Utilities

| Command | Description |
|---------|-------------|
| `node server.js --version` | Check Node.js version |
| `npm list` | List installed dependencies |

## 🎮 How to Use

### Creating a Session
1. Open `http://localhost:3000` in your browser
2. A unique session ID is automatically generated
3. Click "📋 Copy Link" to copy the interview link
4. Share this link with interview candidates

### Joining a Session
1. Candidates receive the interview link
2. Clicking the link takes them directly to the session
3. They can immediately start editing code

### Collaborating
1. **Type Code** - Start typing in the code editor
2. **Select Language** - Choose language from dropdown for syntax highlighting
3. **Execute** - Click "▶ Execute Code" to run JavaScript code
4. **Monitor** - See the connected user count in real-time
5. **View Output** - See execution results and errors in the output panel

## 🔧 Backend Architecture

### Express Server (`server.js`)

**Features:**
- HTTP server on port 3000
- Serves frontend static files
- CORS enabled for cross-origin requests
- WebSocket server for real-time communication

**Session Management:**
- Each session has a unique ID (8-character UUID)
- Stores session code, language, and connected clients
- Automatic cleanup when all clients disconnect

**WebSocket Message Types:**

| Message | From | To | Purpose |
|---------|------|-----|---------|
| `join` | Client | Server | Connect to session |
| `codeChange` | Client | Server → All | Code update |
| `languageChange` | Client | Server → All | Language selection |
| `executeCode` | Client | Server → All | Code execution |
| `init` | Server | Client | Initial sync |
| `codeUpdate` | Server | Clients | Code sync |
| `userJoined` | Server | Clients | Client count update |

## 🎨 Frontend Architecture

### HTML (`index.html`)
- Responsive layout with editor and output panels
- Language selector dropdown
- Execute button and clear output button
- Copy link button for session sharing
- User count indicator

### Styling (`styles.css`)
- Modern gradient design
- Dark theme for code editor
- Responsive grid layout
- Smooth animations and transitions
- Mobile-friendly breakpoints

### JavaScript (`script.js`)
- **Session Management**: Create/join sessions
- **WebSocket Client**: Connect and communicate with server
- **Code Synchronization**: Handle real-time code updates
- **Syntax Highlighting**: Use Highlight.js library
- **Code Execution**: Run JavaScript code with error handling
- **UI Updates**: Manage user count and output display

## 🌟 Key Features Explained

### 1. Real-time Synchronization
```
User A types "console.log('hello')"
↓
Send to Server via WebSocket
↓
Server broadcasts to all connected clients
↓
User B sees code update immediately
```

### 2. Syntax Highlighting
- Uses **Highlight.js** library
- Supports JavaScript, Python, Java, C++, HTML, CSS, SQL
- Dark theme optimized for code readability

### 3. Code Execution
- JavaScript code runs in browser sandbox
- Console output captured and displayed
- Syntax errors shown in output panel
- Safe execution using `Function()` with strict mode

### 4. Session Sharing
- Unique 8-character session IDs
- Full URL with session parameter
- Copy-to-clipboard functionality

## 🔐 Security Notes

### Current Safeguards
✅ Client-side sandboxing for JavaScript execution  
✅ No eval() used - uses Function() with strict mode  
✅ Session IDs validated  
✅ CORS enabled but restrictive  

### For Production
⚠️ Add authentication  
⚠️ Use WSS (WebSocket Secure)  
⚠️ Implement rate limiting  
⚠️ Add input validation  
⚠️ Set session timeouts  
⚠️ Use containers for multi-language execution  

## 📊 Example Workflow

```
Interview Start
    ↓
Interviewer: http://localhost:3000
    ↓
Copy link → Send to candidate
    ↓
Candidate: Joins via link
    ↓
Both: See "Connected: 2" indicator
    ↓
Interviewer: Shares problem in chat
    ↓
Candidate: Types solution
    ↓
Interviewer: Sees code in real-time
    ↓
Candidate: Click "Execute" → Runs code
    ↓
Output: Shows results or errors
    ↓
Interview: Discuss solution & feedback
```

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Change PORT in server.js |
| WebSocket connection failed | Check firewall, restart server |
| Code not syncing | Refresh page, check browser console |
| Execute button not working | Ensure JavaScript code is valid |
| Link copy not working | Check browser permissions for clipboard |

## 📈 Performance Considerations

- **Message Throttling**: Code changes debounced to 300ms
- **Scroll Sync**: Synchronized scroll position between editor and highlight layer
- **Memory**: Session cleanup when clients disconnect
- **Network**: WebSocket reduces overhead vs. polling

## 🚀 Deployment

### Local Network
```powershell
# Run on specific IP
$IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Ethernet*"}).IPAddress
# Share URL: http://$IP:3000
```

## 📚 Dependencies

**Backend:**
- `express` - Web framework
- `ws` - WebSocket library
- `cors` - CORS middleware
- `uuid` - Session ID generation

**Frontend:**
- `highlight.js` - Syntax highlighting (CDN)
- Vanilla JavaScript (no build tools needed)

## 🎓 Learning Outcomes

By exploring this project, you'll understand:
- ✅ Express.js server setup
- ✅ WebSocket real-time communication
- ✅ Client-server synchronization patterns
- ✅ DOM manipulation and events
- ✅ Session management
- ✅ Error handling and reconnection logic
- ✅ Safe code execution in browsers

## 📞 Support & Contributions

Found an issue? Have an idea? Feel free to:
- Open an issue with details
- Submit a pull request
- Share feedback on features

## 📄 License

ISC License - Feel free to use this project for learning and development.

---

**Happy interviewing! 🚀**
