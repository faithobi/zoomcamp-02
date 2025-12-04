## Features & Examples

### 1. 📌 Create & Share Sessions

**How it works:**
1. Visit `http://localhost:3000`
2. Unique session ID automatically generated
3. Click "📋 Copy Link" button
4. Share the link with candidates

**Example Link:**
```
http://localhost:3000?session=a1b2c3d4
```

**Features:**
- ✅ 8-character unique IDs
- ✅ One-click copying
- ✅ Visual confirmation
- ✅ Persistent across refreshes

---

### 2. 💻 Real-time Code Editing

**Demo scenario:**
```
Interviewer at http://localhost:3000?session=abc123
Candidate at http://localhost:3000?session=abc123

Interviewer types: "const x = 10;"
↓ (300ms debounce)
Candidate sees: "const x = 10;" instantly
↓
Candidate types: " console.log(x);"
↓
Interviewer sees: "const x = 10; console.log(x);" instantly
```

**Key Features:**
- ✅ Synchronized editing
- ✅ Real-time updates
- ✅ No lag or delays
- ✅ Tab character support
- ✅ Scroll position sync

---

### 3. 🌈 Syntax Highlighting

**Supported Languages:**

| Language | Code Example |
|----------|--------------|
| **JavaScript** | `const arr = [1,2,3];` |
| **Python** | `arr = [1, 2, 3]` |
| **Java** | `int[] arr = {1,2,3};` |
| **C++** | `vector<int> arr {1,2,3};` |
| **HTML** | `<div>Hello</div>` |
| **CSS** | `.class { color: red; }` |
| **SQL** | `SELECT * FROM users;` |

**How to use:**
1. Open code editor
2. Select language from dropdown
3. Code highlighting updates automatically
4. All connected users see same highlighting

**Example - JavaScript:**
```javascript
// Keywords highlighted in purple
const greet = (name) => {
  // Strings highlighted in green
  return `Hello, ${name}!`;
};

// Function call
greet('World');
```

---

### 4. ▶️ Execute Code (JavaScript)

**Supported Features:**

✅ Variables
```javascript
const x = 42;
let y = 10;
var z = x + y;
```

✅ Functions
```javascript
const multiply = (a, b) => a * b;
const result = multiply(5, 3);  // 15
```

✅ Arrays & Objects
```javascript
const data = {
  users: ['Alice', 'Bob', 'Charlie'],
  count: 3
};
console.log(data.users[0]);  // Alice
```

✅ String Operations
```javascript
const text = "Hello, World!";
console.log(text.toUpperCase());  // HELLO, WORLD!
console.log(text.substring(0, 5));  // Hello
```

✅ Array Methods
```javascript
const nums = [1, 2, 3, 4, 5];
nums.map(n => n * 2);  // [2, 4, 6, 8, 10]
nums.filter(n => n > 2);  // [3, 4, 5]
```

✅ Error Handling
```javascript
try {
  throw new Error('Test error');
} catch(e) {
  console.log('Caught:', e.message);
}
```

---

### 5. 👥 User Tracking

**Real-time User Count:**
```
Connected: 1  <- First user joins
Connected: 2  <- Second user joins
Connected: 2  <- Both coding
Connected: 1  <- One user leaves
```

**Features:**
- ✅ Live user count
- ✅ Join notifications
- ✅ Leave notifications
- ✅ Updates without refresh

**Use Cases:**
- Verify all candidates joined
- Identify who's still connected
- Detect disconnections

---

### 6. 🎯 Interview Workflow

### Step-by-Step Example

**Step 1: Setup Interview**
```
1. Interviewer opens http://localhost:3000
2. Session ID generated: "xyzabc12"
3. Interviewer clicks "Copy Link"
4. Link copied: http://localhost:3000?session=xyzabc12
```

**Step 2: Share with Candidate**
```
Interviewer sends link via:
- Email
- Chat
- Video call
- Message

Candidate receives: http://localhost:3000?session=xyzabc12
```

**Step 3: Candidate Joins**
```
Candidate:
1. Clicks link
2. Automatically joins session
3. Sees "Connected: 2" indicator
4. Ready to code
```

**Step 4: Problem Statement**
```
Interviewer:
1. Explains the problem in call
2. Example: "Write a function that reverses a string"
3. Candidate starts typing
```

**Step 5: Coding**
```javascript
// Candidate types solution
const reverseString = (str) => {
  return str.split('').reverse().join('');
};

// Interviewer sees in real-time
// Both can edit and discuss
```

**Step 6: Testing**
```
Candidate:
1. Finishes writing code
2. Clicks "▶ Execute Code"
3. Tests with: reverseString('hello')
```

**Output Panel Shows:**
```
hello
```

**Step 7: Discussion**
```
Interviewer sees output
Points out optimization opportunities
Candidate makes changes
Both see updates in real-time
```

---

### 7. 📋 Advanced Example - Interview Problem

**Problem:** Implement FizzBuzz

**Candidate Solution:**
```javascript
const fizzBuzz = (n) => {
  for (let i = 1; i <= n; i++) {
    let output = '';
    if (i % 3 === 0) output += 'Fizz';
    if (i % 5 === 0) output += 'Buzz';
    console.log(output || i);
  }
};

// Test
fizzBuzz(15);
```

**Output:**
```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
```

**Interviewer can:**
- See code as candidate types
- Execute to verify correctness
- Suggest improvements
- Ask follow-up questions

---

### 8. 🛠️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Insert Tab | `Tab` key |
| Copy | `Ctrl+C` (browser) |
| Paste | `Ctrl+V` (browser) |
| Select All | `Ctrl+A` (browser) |

---

### 9. 🎨 UI Components

**Header:**
- Session ID display
- Copy link button
- Connected user count

**Code Editor:**
- Syntax highlighted code
- Dark theme background
- Smooth scrolling
- Tab support

**Language Selector:**
- Dropdown with 7 languages
- Live update on change
- All users see same language

**Execute Button:**
- Runs JavaScript code
- Shows loading state
- Broadcasts to all users

**Output Panel:**
- Displays console output
- Shows error messages in red
- Clear button to reset
- Auto-scrolls to bottom

---

### 10. 📱 Responsive Design

**Desktop (1024px+):**
- 2-column layout
- Large editor area
- Side-by-side output

**Tablet (768px - 1023px):**
- Stacked layout
- Full-width editor
- Full-width output

**Mobile (< 768px):**
- Single column
- Compact controls
- Touch-friendly buttons

---

### 11. ⚡ Performance Features

**Debouncing:**
```
User types rapidly
↓ Every keystroke
Code updated locally (instant)
↓ Every 300ms
Changes sent to server
↓
Broadcast to other users
```

**Scroll Sync:**
```
User scrolls in editor
↓
Scroll position matched
↓
Highlighting layer scrolls with it
```

**Memory Management:**
```
Session created
Multiple clients join
↓
Code shared in memory
↓
Last client leaves
↓
Session destroyed
Memory released
```

---

### 12. 🔔 Notifications

**Success:**
- "✓ Link copied to clipboard!"

**Errors:**
- "Connection lost. Please refresh the page."
- "Failed to create session"
- "Session not found"

---

### 13. 🎓 Example Interview Questions

**Easy:**
```javascript
// Calculate factorial
const factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);
factorial(5);  // 120
```

**Medium:**
```javascript
// Find most frequent element
const mostFrequent = (arr) => {
  const count = {};
  for (let num of arr) {
    count[num] = (count[num] || 0) + 1;
  }
  return Object.keys(count).reduce((a, b) => 
    count[a] > count[b] ? a : b);
};
```

**Hard:**
```javascript
// Implement debounce function
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
```

---

### 14. 📊 Success Metrics

Track these metrics during interviews:

- ✅ **Session Duration** - How long interview lasted
- ✅ **Code Changes** - Number of edits made
- ✅ **Executions** - How many times code ran
- ✅ **Languages Used** - Which languages tested
- ✅ **Connection Stability** - Reconnects needed

---

### 15. 🚀 Quick Test

**Copy-paste to test the platform:**

```javascript
// Test 1: Basic output
console.log('Platform is working!');

// Test 2: Calculations
const sum = (a, b) => a + b;
console.log(sum(10, 20));

// Test 3: Arrays
const doubled = [1,2,3,4,5].map(n => n * 2);
console.log(doubled);

// Test 4: Strings
console.log('Hello from'.toUpperCase() + ' Interview Platform');
```

---

**All features ready for production interviews!** ✨
