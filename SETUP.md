# Online Coding Interview Platform

A real-time collaborative coding platform for conducting technical interviews. Multiple candidates can connect to the same session and edit code simultaneously with real-time synchronization.

## ✨ Features

- **Create & Share Sessions**: Generate unique shareable links for each interview session
- **Real-time Collaboration**: All connected users see code changes instantly
- **Syntax Highlighting**: Support for multiple programming languages (JavaScript, Python, Java, C++, HTML, CSS, SQL)
- **Live Code Execution**: Execute JavaScript code directly in the browser with live output
- **User Tracking**: See how many candidates are connected to the session
- **Automatic Reconnection**: Built-in reconnection logic for dropped connections
- **Clean UI**: Modern, responsive interface optimized for both desktop and tablet use

## 🏗️ Project Structure

```
zoomcamp-02/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
└── README.md
```

## 🔧 Technology Stack

**Backend:**
- Express.js - Web server framework
- WebSocket (ws) - Real-time bidirectional communication
- CORS - Cross-origin resource sharing
- UUID - Session ID generation

**Frontend:**
- Vanilla JavaScript - No framework dependencies
- HTML5 & CSS3 - UI and styling
- Highlight.js - Syntax highlighting
- WebSocket API - Client-side WebSocket communication

## 🚀 Quick Start

### Prerequisites
- Node.js (v12 or higher)
- npm (comes with Node.js)

### Installation

1. **Install Backend Dependencies**
   ```powershell
   cd backend
   npm install
   ```

2. **Install Frontend (Optional - HTTP server)**
   The frontend can be served via the Express backend automatically.

### Running the Application

1. **Start the Backend Server**
   ```powershell
   cd backend
   npm start
   ```
   
   The server will start on `http://localhost:3000`

2. **Open in Browser**
   - Host: Open `http://localhost:3000` in your browser
   - Candidates: Share the generated session link with candidates

### Example Usage Flow

1. **Start Interview**
   - Go to `http://localhost:3000`
   - The application automatically generates a unique session ID
   - Click "📋 Copy Link" to copy the shareable link

2. **Share with Candidates**
   - Send the copied link to interview candidates
   - They can paste it in their browser to join the same session

3. **Collaborate**
   - Type code in the editor
   - Select the programming language from the dropdown
   - Click "▶ Execute Code" to run JavaScript code
   - All connected users see changes in real-time
   - User count shows how many are connected

## 📡 API Endpoints

### REST Endpoints

- **POST `/api/session`** - Create a new interview session
  - Response: `{ sessionId, url }`

- **GET `/api/session/:id`** - Get session information
  - Response: `{ sessionId, code, language, clients }`

### WebSocket Events

**Client to Server:**
- `join` - Connect to a session
- `codeChange` - Code editor update
- `languageChange` - Programming language selection change
- `cursorMove` - Cursor position update
- `executeCode` - Execute code request

**Server to Client:**
- `init` - Session initialization data
- `codeUpdate` - Code changed by another user
- `languageUpdate` - Language changed by another user
- `userJoined` - New user connected
- `userLeft` - User disconnected
- `executeCode` - Execute code notification
- `error` - Error message

## 💻 Editor Features

### Keyboard Shortcuts
- **Tab** - Insert tab character (4 spaces)
- **Ctrl+C / Cmd+C** - Copy selected text
- **Ctrl+V / Cmd+V** - Paste text

### Language Support
- JavaScript
- Python
- Java
- C++
- HTML
- CSS
- SQL

### Code Execution
- JavaScript code executes in the browser sandbox
- Console output is captured and displayed
- Syntax errors are highlighted with error messages

## 🔐 Security Considerations

### Current Implementation
- JavaScript execution uses `Function()` with strict mode
- Console is sandboxed within the browser
- No external API calls for code execution
- WebSocket connections validate session IDs

### For Production
- Implement authentication and authorization
- Use secure WebSocket (WSS) with TLS/SSL
- Validate and sanitize all user input
- Implement rate limiting
- Consider sandbox environments for additional languages
- Add session expiration and cleanup
- Implement audit logging

## 🐛 Troubleshooting

### Connection Issues
- Ensure backend server is running on port 3000
- Check firewall settings for WebSocket connections
- Clear browser cache and try connecting again

### Code Not Syncing
- Check browser console for errors
- Verify WebSocket connection status
- Reload the page and rejoin the session

### Execute Code Not Working
- Only JavaScript execution is supported in the browser
- Check browser console for execution errors
- Ensure no syntax errors in the code

## 📝 Example Code Snippets

### Test JavaScript
```javascript
// Simple calculation
const add = (a, b) => a + b;
add(5, 3);

// Array operations
const numbers = [1, 2, 3, 4, 5];
numbers.map(n => n * 2);

// String manipulation
"Hello, World!".toUpperCase();
```

## 🛠️ Development

### Project Layout
- Backend handles session management and real-time synchronization
- Frontend provides UI and handles local code editing
- WebSocket enables real-time bidirectional communication

### Adding New Languages
1. Update language dropdown in `index.html`
2. Update highlight.js language mapping in `script.js`
3. For execution, implement backend service for that language

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Highlight.js](https://highlightjs.org/)
- [Node.js Documentation](https://nodejs.org/docs/)

## 📄 License

This project is open source and available under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for technical interviews**
