## Testing Guide

### Manual Testing Checklist

#### Session Creation & Sharing
- [ ] Visit `http://localhost:3000` - should create new session
- [ ] Session ID displays in header
- [ ] "Copy Link" button copies URL to clipboard
- [ ] Notification appears after copying
- [ ] Pasting link opens same session

#### Real-time Collaboration
- [ ] Open 2 browser windows with same session
- [ ] Type in one editor - appears in other (300ms debounce)
- [ ] Changes persist while both windows open
- [ ] Connected users count updates correctly
- [ ] Scroll position syncs between windows

#### Code Execution
- [ ] Click "Execute" with JavaScript code
- [ ] Output appears in output panel
- [ ] Console.log output displays correctly
- [ ] Syntax errors display as red text
- [ ] Clear button clears output panel
- [ ] Code not executed when user disconnects

#### Language Selection
- [ ] Select different language from dropdown
- [ ] Syntax highlighting updates immediately
- [ ] Language persists across refreshes
- [ ] All users see same language

#### Connection Handling
- [ ] Page loads without backend - shows error
- [ ] Disconnect network - reconnection attempts
- [ ] Reconnect after 2s - re-joins session
- [ ] Max 5 reconnection attempts
- [ ] Error message after max attempts

#### UI/UX
- [ ] Editor has dark theme
- [ ] Responsive on mobile (tablet size)
- [ ] Buttons have hover effects
- [ ] Loading states are smooth
- [ ] No console errors in devtools

---

### Browser Testing

```javascript
// Open browser console and test:

// Test 1: Session API
fetch('http://localhost:3000/api/session', {method: 'POST'})
  .then(r => r.json())
  .then(d => console.log('Session:', d))

// Test 2: Get session info
fetch('http://localhost:3000/api/session/ABC123')
  .then(r => r.json())
  .then(d => console.log('Info:', d))

// Test 3: WebSocket connection
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.log('Error:', e);
```

---

### Load Testing

#### Single Session - Multiple Users
```powershell
# Simulate 5 simultaneous connections
for ($i = 1; $i -le 5; $i++) {
    Start-Process "chrome.exe" "http://localhost:3000?session=test-session"
}
```

#### Message Frequency
- Type continuously in one editor
- Monitor network tab in devtools
- Should see messages every 300ms (debounce rate)

#### Output Performance
- Execute code with large output
- Check for UI lag or slowdown
- Monitor memory usage in devtools

---

### Code Execution Tests

#### JavaScript - Valid
```javascript
console.log('Hello World')
```

#### JavaScript - Variables
```javascript
const x = 10;
const y = 20;
x + y
```

#### JavaScript - Functions
```javascript
const add = (a, b) => a + b;
add(5, 3)
```

#### JavaScript - Arrays
```javascript
const arr = [1, 2, 3, 4, 5];
arr.map(x => x * 2)
```

#### JavaScript - Error Handling
```javascript
throw new Error('Test error');
```

#### JavaScript - Syntax Errors
```javascript
const x = ;  // Should show error
```

---

### WebSocket Message Testing

#### Using Browser Console
```javascript
// Send code change
ws.send(JSON.stringify({
  type: 'codeChange',
  code: 'const test = 42;'
}))

// Send language change
ws.send(JSON.stringify({
  type: 'languageChange',
  language: 'python'
}))

// Send code execution
ws.send(JSON.stringify({
  type: 'executeCode',
  code: 'console.log("test");',
  language: 'javascript'
}))
```

---

### Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Session creation time | < 100ms | - |
| Code sync delay | < 400ms | - |
| WebSocket latency | < 50ms | - |
| Memory per session | < 5MB | - |
| Concurrent users limit | 100+ | - |

---

### Cross-Browser Testing

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ | Full support |
| Firefox | ✅ | Full support |
| Safari | ✅ | Full support |
| Edge | ✅ | Full support |
| IE 11 | ❌ | Not supported |

---

### Accessibility Testing

- [ ] Tab navigation works through all controls
- [ ] Screen reader can read content
- [ ] Keyboard shortcuts are available
- [ ] Color contrast is adequate
- [ ] Focus states are visible

---

### Security Testing

```javascript
// Test code injection protection
// Type these in editor and execute:

// Test 1: Try accessing window object
window.location.href

// Test 2: Try accessing document
document.body.innerHTML

// Test 3: Try external calls
fetch('http://example.com')

// Test 4: Try localStorage access
localStorage.setItem('test', 'value')
```

---

### Stress Testing

#### High Message Rate
- Type rapidly to generate many messages
- Monitor server console for errors
- Check for message loss or corruption

#### Large Code Files
- Paste 1000+ lines of code
- Check performance impact
- Monitor memory usage

#### Long Sessions
- Keep session open for 1+ hour
- Check for memory leaks
- Verify reconnection still works

---

### Regression Testing (After Updates)

After any code changes:
1. Run all manual tests above
2. Test with 3+ simultaneous users
3. Test network disconnect/reconnect
4. Execute code in all supported languages
5. Check browser console for errors

---

### Test Results Template

```
Date: YYYY-MM-DD
Tester: [Name]
Browser: [Browser/Version]
Test Suite: [Session/Collab/Execution/etc]

✅ Passed: [count]
❌ Failed: [count]
⚠️ Issues: [list]

Notes:
```

---

### Automated Testing (Future Enhancement)

```javascript
// Example with Jest/Supertest
describe('Coding Interview Platform', () => {
  test('should create session', async () => {
    const res = await request(app)
      .post('/api/session')
    expect(res.status).toBe(200)
    expect(res.body.sessionId).toBeDefined()
  })

  test('should get session info', async () => {
    const res = await request(app)
      .get('/api/session/test-id')
    expect(res.status).toBe(200)
  })
})
```

---

### Report Issues

When testing, if you find issues, please include:
1. **Steps to reproduce** - Exact steps that cause the issue
2. **Expected behavior** - What should happen
3. **Actual behavior** - What actually happened
4. **Browser & OS** - Environment details
5. **Screenshots/video** - If applicable
6. **Console errors** - From browser devtools
