const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Store active sessions
const sessions = new Map();

// Session data structure
class Session {
  constructor(id) {
    this.id = id;
    this.code = '';
    this.language = 'javascript';
    this.clients = new Set();
    this.createdAt = new Date();
  }

  addClient(ws) {
    this.clients.add(ws);
  }

  removeClient(ws) {
    this.clients.delete(ws);
    if (this.clients.size === 0) {
      sessions.delete(this.id);
    }
  }

  broadcast(message, excludeClient = null) {
    this.clients.forEach(client => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  broadcastAll(message) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

// Create new session endpoint
app.post('/api/session', (req, res) => {
  const sessionId = uuidv4().slice(0, 8);
  const session = new Session(sessionId);
  sessions.set(sessionId, session);
  res.json({ sessionId, url: `http://localhost:3000?session=${sessionId}` });
});

// Get session info
app.get('/api/session/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (session) {
    res.json({
      sessionId: session.id,
      code: session.code,
      language: session.language,
      clients: session.clients.size
    });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  let currentSession = null;
  let clientId = uuidv4().slice(0, 8);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'join':
          const sessionId = message.sessionId;
          currentSession = sessions.get(sessionId);

          if (currentSession) {
            currentSession.addClient(ws);
            // Send current state to new client
            ws.send(JSON.stringify({
              type: 'init',
              code: currentSession.code,
              language: currentSession.language,
              clients: currentSession.clients.size,
              clientId: clientId
            }));

            // Notify others of new client
            currentSession.broadcast({
              type: 'userJoined',
              clients: currentSession.clients.size
            }, ws);
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Session not found'
            }));
            ws.close();
          }
          break;

        case 'codeChange':
          if (currentSession) {
            currentSession.code = message.code;
            currentSession.broadcast({
              type: 'codeUpdate',
              code: message.code,
              clientId: clientId
            }, ws);
          }
          break;

        case 'languageChange':
          if (currentSession) {
            currentSession.language = message.language;
            currentSession.broadcastAll({
              type: 'languageUpdate',
              language: message.language
            });
          }
          break;

        case 'cursorMove':
          if (currentSession) {
            currentSession.broadcast({
              type: 'cursorUpdate',
              clientId: clientId,
              line: message.line,
              column: message.column
            }, ws);
          }
          break;

        case 'executeCode':
          if (currentSession) {
            currentSession.broadcast({
              type: 'executeCode',
              code: message.code,
              language: message.language,
              clientId: clientId
            }, ws);
          }
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    if (currentSession) {
      currentSession.removeClient(ws);
      if (currentSession.clients.size > 0) {
        currentSession.broadcast({
          type: 'userLeft',
          clients: currentSession.clients.size
        });
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready`);
});

// Export server for programmatic control (used by integration tests)
module.exports = server;
