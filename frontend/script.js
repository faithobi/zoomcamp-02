// Global state
let ws = null;
let sessionId = null;
let clientId = null;
let isConnected = false;
let currentLanguage = 'javascript';
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;

// API base URL - works for both development and production
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : window.location.origin;

// WebSocket URL - works for both development and production
const WS_URL = window.location.hostname === 'localhost'
    ? 'ws://localhost:3000'
    : `ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host}`;

// WASM execution state
let pyodideReady = false;
let pyodide = null;

// Initialize Pyodide for Python WASM execution
async function initPyodide() {
  try {
    if (typeof globalThis.loadPyodide === 'undefined') {
      console.warn('Pyodide not available yet, will retry on first Python execution');
      return;
    }
    pyodide = await globalThis.loadPyodide();
    pyodideReady = true;
    console.log('✓ Pyodide initialized for Python WASM execution');
  } catch (err) {
    console.error('Failed to initialize Pyodide:', err);
  }
}

// Initialize Pyodide when script loads
window.addEventListener('load', initPyodide);

// Get session ID from URL or create new one
async function initializeSession() {
    const params = new URLSearchParams(window.location.search);
    sessionId = params.get('session');

    if (!sessionId) {
        // Create new session
        try {
            const response = await fetch(`${API_BASE_URL}/api/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            sessionId = data.sessionId;
            window.history.pushState({}, '', `?session=${sessionId}`);
        } catch (error) {
            console.error('Failed to create session:', error);
            showNotification('Failed to create session', 'error');
            return;
        }
    }

    updateSessionDisplay();
    connectWebSocket();
}

function updateSessionDisplay() {
    const sessionDisplay = document.getElementById('sessionId');
    if (sessionDisplay) {
        sessionDisplay.textContent = `Session: ${sessionId}`;
    }
}

function connectWebSocket() {
    try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('WebSocket connected');
            isConnected = true;
            reconnectAttempts = 0;
            
            // Join the session
            ws.send(JSON.stringify({
                type: 'join',
                sessionId: sessionId
            }));
        };

        ws.onmessage = (event) => {
            handleMessage(JSON.parse(event.data));
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            isConnected = false;
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            isConnected = false;
            attemptReconnect();
        };
    } catch (error) {
        console.error('WebSocket connection failed:', error);
        attemptReconnect();
    }
}

function attemptReconnect() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Reconnecting... attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
        setTimeout(connectWebSocket, RECONNECT_DELAY);
    } else {
        showNotification('Connection lost. Please refresh the page.', 'error');
    }
}

function handleMessage(message) {
    switch (message.type) {
        case 'init':
            clientId = message.clientId;
            const editor = document.getElementById('codeEditor');
            editor.value = message.code || '';
            currentLanguage = message.language || 'javascript';
            document.getElementById('language').value = currentLanguage;
            updateHighlight();
            updateUserCount(message.clients);
            break;

        case 'codeUpdate':
            if (message.clientId !== clientId) {
                const editor = document.getElementById('codeEditor');
                const scrollTop = editor.scrollTop;
                const scrollLeft = editor.scrollLeft;
                editor.value = message.code;
                editor.scrollTop = scrollTop;
                editor.scrollLeft = scrollLeft;
                updateHighlight();
            }
            break;

        case 'languageUpdate':
            currentLanguage = message.language;
            document.getElementById('language').value = currentLanguage;
            updateHighlight();
            break;

        case 'userJoined':
        case 'userLeft':
            updateUserCount(message.clients);
            break;

        case 'executeCode':
            if (message.clientId !== clientId) {
                executeCode(message.code, message.language);
            }
            break;

        case 'error':
            showNotification(message.message, 'error');
            break;
    }
}

function sendCodeChange(code) {
    if (isConnected && ws) {
        ws.send(JSON.stringify({
            type: 'codeChange',
            code: code
        }));
    }
}

function sendLanguageChange(language) {
    currentLanguage = language;
    if (isConnected && ws) {
        ws.send(JSON.stringify({
            type: 'languageChange',
            language: language
        }));
    }
    updateHighlight();
}

function sendCodeExecution(code, language) {
    if (isConnected && ws) {
        ws.send(JSON.stringify({
            type: 'executeCode',
            code: code,
            language: language,
            clientId: clientId
        }));
    }
}

// Syntax highlighting
function updateHighlight() {
    const code = document.getElementById('codeEditor').value;
    const highlightCode = document.getElementById('highlightCode');
    highlightCode.textContent = code;
    highlightCode.className = `language-${currentLanguage}`;
    
    // Use highlight.js to highlight the code
    if (window.hljs) {
        window.hljs.highlightElement(highlightCode);
    }

    // Sync scroll position
    syncScroll();
}

function syncScroll() {
    const editor = document.getElementById('codeEditor');
    const highlighter = document.getElementById('highlightedCode');
    highlighter.scrollTop = editor.scrollTop;
    highlighter.scrollLeft = editor.scrollLeft;
}

// Code execution (browser-based WASM for security)
function executeCode(code, language) {
    const outputContainer = document.getElementById('output');
    outputContainer.innerHTML = '';

    // Show executing message
    const executingDiv = document.createElement('div');
    executingDiv.className = 'output-line';
    executingDiv.textContent = '⏳ Executing...';
    outputContainer.appendChild(executingDiv);

    if (language === 'javascript') {
        executeJavaScript(code, outputContainer);
    } else if (language === 'python') {
        executePython(code, outputContainer);
    } else {
        // For other languages, show placeholder
        outputContainer.innerHTML = `<div class="output-line">Language '${language}' execution not yet supported. Currently supported: JavaScript, Python</div>`;
    }
}

function executeJavaScript(code, outputContainer) {
    try {
        outputContainer.innerHTML = '';
        const originalLog = console.log;
        const originalError = console.error;
        const logs = [];

        // Capture console output
        console.log = (...args) => {
            logs.push(args.map(arg => formatOutput(arg)).join(' '));
        };

        console.error = (...args) => {
            logs.push('ERROR: ' + args.map(arg => formatOutput(arg)).join(' '));
        };

        // Execute code in a safe context
        try {
            const result = Function('"use strict"; return (' + code + ')')();
            if (result !== undefined) {
                logs.push(String(result));
            }
        } catch (error) {
            logs.push(`ERROR: ${error.message}`);
        }

        // Restore console
        console.log = originalLog;
        console.error = originalError;

        // Display output
        displayExecutionOutput(outputContainer, logs);
    } catch (error) {
        const errorLine = document.createElement('div');
        errorLine.className = 'output-line error';
        errorLine.textContent = `ERROR: ${error.message}`;
        outputContainer.appendChild(errorLine);
        console.error(error);
    }
}

async function executePython(code, outputContainer) {
    try {
        outputContainer.innerHTML = '';
        
        // Ensure Pyodide is loaded
        if (!pyodideReady) {
            if (typeof globalThis.loadPyodide === 'undefined') {
                const errorLine = document.createElement('div');
                errorLine.className = 'output-line error';
                errorLine.textContent = 'ERROR: Python runtime (Pyodide) is still loading. Please try again in a moment.';
                outputContainer.appendChild(errorLine);
                return;
            }
            
            pyodide = await globalThis.loadPyodide();
            pyodideReady = true;
        }

        const logs = [];
        
        // Capture Python output using StringIO
        const wrappedCode = `
import sys
import io

# Capture stdout
old_stdout = sys.stdout
sys.stdout = io.StringIO()

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    sys.stdout = old_stdout
    print(f"ERROR: {type(e).__name__}: {str(e)}", file=sys.stderr)
    raise

# Get the captured output and restore stdout
output = sys.stdout.getvalue()
sys.stdout = old_stdout
output
`;

        try {
            const result = await pyodide.runPythonAsync(wrappedCode);
            
            // result is the last expression (output string)
            if (result !== null && result !== undefined) {
                const outputStr = String(result).trim();
                if (outputStr) {
                    logs.push(outputStr);
                }
            }
        } catch (pyError) {
            logs.push(`ERROR: ${pyError.message}`);
        }
        
        displayExecutionOutput(outputContainer, logs);
    } catch (error) {
        const errorLine = document.createElement('div');
        errorLine.className = 'output-line error';
        errorLine.textContent = `ERROR: ${error.message}`;
        outputContainer.appendChild(errorLine);
        console.error('Python execution error:', error);
    }
}

function displayExecutionOutput(outputContainer, logs) {
    if (logs.length === 0 || logs.every(log => !log.trim())) {
        outputContainer.innerHTML = '<p class="placeholder">No output</p>';
    } else {
        logs.forEach(log => {
            if (log.trim()) {
                const line = document.createElement('div');
                line.className = 'output-line' + (log.includes('ERROR') ? ' error' : '');
                line.textContent = log;
                outputContainer.appendChild(line);
            }
        });
    }
}


function formatOutput(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
    }
    return String(value);
}

function updateUserCount(count) {
    const userCountElement = document.getElementById('userCount');
    if (userCountElement) {
        userCountElement.textContent = `Connected: ${count}`;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function copySessionLink() {
    const link = `${window.location.origin}?session=${sessionId}`;
    navigator.clipboard.writeText(link).then(() => {
        showNotification('✓ Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy link', 'error');
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const codeEditor = document.getElementById('codeEditor');
    const languageSelect = document.getElementById('language');
    const executeBtn = document.getElementById('executeBtn');
    const clearOutputBtn = document.getElementById('clearOutput');
    const copyLinkBtn = document.getElementById('copyLink');

    // Editor input with debounce
    let typingTimer;
    codeEditor.addEventListener('input', (e) => {
        updateHighlight();
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            sendCodeChange(e.target.value);
        }, 300);
    });

    codeEditor.addEventListener('scroll', syncScroll);
    codeEditor.addEventListener('keydown', (e) => {
        // Handle tab key
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = codeEditor.selectionStart;
            const end = codeEditor.selectionEnd;
            const newValue = codeEditor.value.substring(0, start) + '\t' + codeEditor.value.substring(end);
            codeEditor.value = newValue;
            codeEditor.selectionStart = codeEditor.selectionEnd = start + 1;
            updateHighlight();
            sendCodeChange(newValue);
        }
    });

    languageSelect.addEventListener('change', (e) => {
        sendLanguageChange(e.target.value);
    });

    executeBtn.addEventListener('click', () => {
        const code = codeEditor.value;
        executeCode(code, currentLanguage);
        sendCodeExecution(code, currentLanguage);
    });

    clearOutputBtn.addEventListener('click', () => {
        document.getElementById('output').innerHTML = '<p class="placeholder">Output will appear here...</p>';
    });

    copyLinkBtn.addEventListener('click', copySessionLink);

    // Initialize
    initializeSession();
});
