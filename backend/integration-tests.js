const fs = require('fs');
// Truncate previous output file and capture console output to a logfile for reliable test logs
try {
  fs.writeFileSync(__dirname + '/test-output.txt', '');
} catch (e) {
  // ignore
}
const logStream = fs.createWriteStream(__dirname + '/test-output.txt', { flags: 'a' });
const origConsoleLog = console.log;
const origConsoleError = console.error;
console.log = (...args) => {
  try { logStream.write(args.join(' ') + '\n'); } catch (e) {}
  origConsoleLog(...args);
};
console.error = (...args) => {
  try { logStream.write(args.join(' ') + '\n'); } catch (e) {}
  origConsoleError(...args);
};

const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');

// Test configuration
const SERVER_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';
const PORT = 3000;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

let serverProcess = null;
let testsPassed = 0;
let testsFailed = 0;

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(name, fn) {
  return new Promise((resolve) => {
    try {
      fn()
        .then(() => {
          log(`  ✓ ${name}`, 'green');
          testsPassed++;
          resolve();
        })
        .catch((error) => {
          log(`  ✗ ${name}`, 'red');
          log(`    Error: ${error.message}`, 'red');
          testsFailed++;
          resolve();
        });
    } catch (error) {
      log(`  ✗ ${name}`, 'red');
      log(`    Error: ${error.message}`, 'red');
      testsFailed++;
      resolve();
    }
  });
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Start server
function startServer() {
  return new Promise((resolve, reject) => {
    try {
      // Require the server in-process so tests can control it reliably across platforms
      const server = require('./server.js');
      serverProcess = server;

      if (server && server.listening) {
        // Already listening
        setTimeout(() => resolve(), 200);
      } else if (server && server.on) {
        // Wait for listening event
        server.on('listening', () => setTimeout(() => resolve(), 200));
      } else {
        // Fallback: small delay
        setTimeout(() => resolve(), 500);
      }
    } catch (err) {
      reject(err);
    }
  });
}

// Stop server
function stopServer() {
  return new Promise((resolve) => {
    if (serverProcess && typeof serverProcess.close === 'function') {
      try {
        serverProcess.close(() => setTimeout(resolve, 200));
      } catch (e) {
        setTimeout(resolve, 200);
      }
    } else {
      resolve();
    }
  });
}

// HTTP request helper
function httpRequest(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(SERVER_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// WebSocket connection helper
function connectWebSocket() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      resolve(ws);
    });

    ws.on('error', (error) => {
      reject(error);
    });

    setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket connection timeout'));
      }
    }, 3000);
  });
}

// Test suites
async function testSessionCreation() {
  log('\n📋 Testing Session Creation', 'blue');

  await test('POST /api/session creates a new session', async () => {
    const res = await httpRequest('POST', '/api/session');
    assertEqual(res.status, 200, 'Status should be 200');
    assertTrue(res.data.sessionId, 'Response should contain sessionId');
    assertTrue(res.data.url, 'Response should contain url');
    assertTrue(res.data.sessionId.length === 8, 'Session ID should be 8 characters');
  });

  await test('Session ID is unique for each request', async () => {
    const res1 = await httpRequest('POST', '/api/session');
    const res2 = await httpRequest('POST', '/api/session');
    assertTrue(res1.data.sessionId !== res2.data.sessionId, 'Session IDs should be different');
  });

  await test('Session URL contains session parameter', async () => {
    const res = await httpRequest('POST', '/api/session');
    assertTrue(
      res.data.url.includes(`session=${res.data.sessionId}`),
      'URL should contain session parameter'
    );
  });
}

async function testSessionRetrieval() {
  log('\n🔍 Testing Session Retrieval', 'blue');

  await test('GET /api/session/:id returns session info', async () => {
    const createRes = await httpRequest('POST', '/api/session');
    const sessionId = createRes.data.sessionId;

    const getRes = await httpRequest('GET', `/api/session/${sessionId}`);
    assertEqual(getRes.status, 200, 'Status should be 200');
    assertEqual(getRes.data.sessionId, sessionId, 'Session ID should match');
    assertEqual(getRes.data.language, 'javascript', 'Default language should be javascript');
    assertEqual(getRes.data.clients, 0, 'Initial client count should be 0');
  });

  await test('GET /api/session/:id returns 404 for non-existent session', async () => {
    const res = await httpRequest('GET', '/api/session/invalid123');
    assertEqual(res.status, 404, 'Status should be 404');
  });

  await test('Session contains correct initial data', async () => {
    const createRes = await httpRequest('POST', '/api/session');
    const sessionId = createRes.data.sessionId;

    const getRes = await httpRequest('GET', `/api/session/${sessionId}`);
    assertEqual(getRes.data.code, '', 'Initial code should be empty');
    assertEqual(getRes.data.language, 'javascript', 'Language should be javascript');
  });
}

async function testWebSocketConnection() {
  log('\n🔌 Testing WebSocket Connection', 'blue');

  await test('WebSocket connects successfully', async () => {
    const ws = await connectWebSocket();
    assertTrue(ws.readyState === WebSocket.OPEN, 'WebSocket should be open');
    ws.close();
  });

  await test('Server closes connection on invalid join', async () => {
    const ws = await connectWebSocket();
    return new Promise((resolve, reject) => {
      ws.send(JSON.stringify({ type: 'join', sessionId: 'invalid' }));

      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for error message'));
      }, 2000);

      ws.on('message', (data) => {
        clearTimeout(timeout);
        const msg = JSON.parse(data);
        if (msg.type === 'error') {
          resolve();
        }
      });

      ws.on('close', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  });
}

async function testCodeSynchronization() {
  log('\n🔄 Testing Code Synchronization', 'blue');

  await test('Client receives code on join', async () => {
    // Create session and get ID
    const createRes = await httpRequest('POST', '/api/session');
    const sessionId = createRes.data.sessionId;

    // Connect first client and send code
    const ws1 = await connectWebSocket();
    return new Promise((resolve, reject) => {
      ws1.send(JSON.stringify({ type: 'join', sessionId }));

      let joinedFirstClient = false;

      ws1.on('message', (data) => {
        const msg = JSON.parse(data);

        if (msg.type === 'init' && !joinedFirstClient) {
          joinedFirstClient = true;
          // Send code change
          ws1.send(JSON.stringify({
            type: 'codeChange',
            code: 'console.log("test");'
          }));

          // Connect second client
          connectWebSocket().then((ws2) => {
            ws2.send(JSON.stringify({ type: 'join', sessionId }));

            ws2.on('message', (data2) => {
              const msg2 = JSON.parse(data2);
              if (msg2.type === 'init') {
                try {
                  assertEqual(
                    msg2.code,
                    'console.log("test");',
                    'Second client should receive code from first client'
                  );
                  resolve();
                } catch (error) {
                  reject(error);
                } finally {
                  ws1.close();
                  ws2.close();
                }
              }
            });
          }).catch(reject);
        }
      });
    });
  });

  await test('Code changes broadcast to all clients', async () => {
    const createRes = await httpRequest('POST', '/api/session');
    const sessionId = createRes.data.sessionId;

    const ws1 = await connectWebSocket();
    const ws2 = await connectWebSocket();

    return new Promise((resolve, reject) => {
      let client1Ready = false;
      let client2Ready = false;

      // Setup client 2 listener
      ws2.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'codeUpdate') {
          try {
            assertEqual(msg.code, 'const x = 42;', 'Client 2 should receive code update');
            resolve();
          } catch (error) {
            reject(error);
          } finally {
            ws1.close();
            ws2.close();
          }
        }
      });

      // Client 1 joins
      ws1.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'init' && !client1Ready) {
          client1Ready = true;

          // Join client 2
          ws2.send(JSON.stringify({ type: 'join', sessionId }));
        }
      });

      // Client 2 ready
      ws2.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'init' && !client2Ready) {
          client2Ready = true;
          // Client 1 sends code change
          ws1.send(JSON.stringify({
            type: 'codeChange',
            code: 'const x = 42;'
          }));
        }
      });

      ws1.send(JSON.stringify({ type: 'join', sessionId }));
    });
  });
}

async function testLanguageChange() {
  log('\n🌐 Testing Language Change', 'blue');

  await test('Language change broadcasts to all clients', async () => {
    const createRes = await httpRequest('POST', '/api/session');
    const sessionId = createRes.data.sessionId;

    const ws1 = await connectWebSocket();
    const ws2 = await connectWebSocket();

    return new Promise((resolve, reject) => {
      let client1Ready = false;
      let client2Ready = false;
      let client1Sent = false;

      ws2.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'languageUpdate') {
          try {
            assertEqual(msg.language, 'python', 'Client 2 should receive language update');
            resolve();
          } catch (error) {
            reject(error);
          } finally {
            ws1.close();
            ws2.close();
          }
        }
      });

      ws1.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'init' && !client1Ready) {
          client1Ready = true;
          ws2.send(JSON.stringify({ type: 'join', sessionId }));
        }
      });

      ws2.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'init' && !client2Ready && !client1Sent) {
          client2Ready = true;
          client1Sent = true;
          ws1.send(JSON.stringify({
            type: 'languageChange',
            language: 'python'
          }));
        }
      });

      ws1.send(JSON.stringify({ type: 'join', sessionId }));
    });
  });
}

async function testUserTracking() {
  log('\n👥 Testing User Tracking', 'blue');

  await test('User count updates when clients join', async () => {
    const createRes = await httpRequest('POST', '/api/session');
    const sessionId = createRes.data.sessionId;

    const ws1 = await connectWebSocket();
    const ws2 = await connectWebSocket();

    return new Promise((resolve, reject) => {
      let client1Joined = false;

      ws2.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'userJoined') {
          try {
            assertTrue(msg.clients === 2, 'Should have 2 clients connected');
            resolve();
          } catch (error) {
            reject(error);
          } finally {
            ws1.close();
            ws2.close();
          }
        }
      });

      ws1.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'init' && !client1Joined) {
          client1Joined = true;
          ws2.send(JSON.stringify({ type: 'join', sessionId }));
        }
      });

      ws1.send(JSON.stringify({ type: 'join', sessionId }));
    });
  });

  await test('User count updates when clients leave', async () => {
    const createRes = await httpRequest('POST', '/api/session');
    const sessionId = createRes.data.sessionId;

    const ws1 = await connectWebSocket();
    const ws2 = await connectWebSocket();

    return new Promise((resolve, reject) => {
      let client1Joined = false;
      let client2Joined = false;

      ws1.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'init' && !client1Joined) {
          client1Joined = true;
          ws2.send(JSON.stringify({ type: 'join', sessionId }));
        }
        if (msg.type === 'userLeft') {
          try {
            assertTrue(msg.clients === 1, 'Should have 1 client after one leaves');
            resolve();
          } catch (error) {
            reject(error);
          } finally {
            ws1.close();
          }
        }
      });

      ws2.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'init' && !client2Joined) {
          client2Joined = true;
          setTimeout(() => ws2.close(), 100);
        }
      });

      ws1.send(JSON.stringify({ type: 'join', sessionId }));
    });
  });
}

async function testErrorHandling() {
  log('\n⚠️  Testing Error Handling', 'blue');

  await test('Server handles invalid message type gracefully', async () => {
    const createRes = await httpRequest('POST', '/api/session');
    const sessionId = createRes.data.sessionId;

    const ws = await connectWebSocket();
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        // If no error occurs, the server handled it gracefully
        resolve();
      }, 1000);

      ws.send(JSON.stringify({ type: 'join', sessionId }));

      ws.on('message', () => {
        clearTimeout(timeout);
        ws.send(JSON.stringify({ type: 'invalidType', data: 'test' }));
        setTimeout(() => resolve(), 200);
      });

      ws.on('close', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  });

  await test('Server handles malformed JSON gracefully', async () => {
    const ws = await connectWebSocket();
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(), 500);

      ws.on('error', () => {
        clearTimeout(timeout);
        resolve();
      });

      ws.on('close', () => {
        clearTimeout(timeout);
        resolve();
      });

      try {
        ws.send('{ invalid json');
      } catch (e) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
}

async function testCodeExecution() {
  log('\n▶️  Testing Code Execution', 'blue');

  await test('Code execution message broadcasts to all clients', async () => {
    const createRes = await httpRequest('POST', '/api/session');
    const sessionId = createRes.data.sessionId;

    const ws1 = await connectWebSocket();
    const ws2 = await connectWebSocket();

    return new Promise((resolve, reject) => {
      let client1Ready = false;
      let client2Ready = false;
      let executionSent = false;

      ws2.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'executeCode') {
          try {
            assertEqual(
              msg.code,
              'console.log("test");',
              'Client 2 should receive executeCode message'
            );
            resolve();
          } catch (error) {
            reject(error);
          } finally {
            ws1.close();
            ws2.close();
          }
        }
      });

      ws1.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'init' && !client1Ready) {
          client1Ready = true;
          ws2.send(JSON.stringify({ type: 'join', sessionId }));
        }
      });

      ws2.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'init' && !client2Ready && !executionSent) {
          client2Ready = true;
          executionSent = true;
          ws1.send(JSON.stringify({
            type: 'executeCode',
            code: 'console.log("test");',
            language: 'javascript'
          }));
        }
      });

      ws1.send(JSON.stringify({ type: 'join', sessionId }));
    });
  });
}

// Main test runner
async function runTests() {
  log('\n🧪 STARTING INTEGRATION TESTS', 'yellow');
  log('================================\n', 'yellow');

  try {
    log('Starting server...', 'blue');
    await startServer();
    log('✓ Server started successfully\n', 'green');

    await testSessionCreation();
    await testSessionRetrieval();
    await testWebSocketConnection();
    await testCodeSynchronization();
    await testLanguageChange();
    await testUserTracking();
    await testErrorHandling();
    await testCodeExecution();

    log('\n================================', 'yellow');
    log(`\n📊 Test Results:`, 'yellow');
    log(`   Passed: ${testsPassed}`, 'green');
    log(`   Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
    log(`   Total: ${testsPassed + testsFailed}\n`, 'yellow');

    if (testsFailed === 0) {
      log('✅ All tests passed!', 'green');
      process.exit(0);
    } else {
      log(`❌ ${testsFailed} test(s) failed`, 'red');
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await stopServer();
  }
}

// Run tests
runTests();
