# Leak Detector

Zero-dependency PII and credential leak detection with risk scoring.

## Project Structure

```
leak-detector/
├── src/
│   └── leakDetector.js      ← core module (import this in your code)
├── tests/
│   └── leakDetector.test.js ← Jest test suite
├── index.js                 ← CLI runner
├── server.js                ← Express API example
└── package.json
```

## Setup

```bash
npm install
```

## Usage

### 1. As a module (import in your code)
```js
const { analyzeLeak } = require('./src/leakDetector');

const result = analyzeLeak("email: abc@gmail.com password: hunter2");
console.log(result);
// { emails: [...], passwords: [...], risk_score: "MEDIUM", explanation: "..." }
```

### 2. CLI
```bash
node index.js "email: abc@gmail.com password: 123456 AKIAIOSFODNN7EXAMPLE"
```

### 3. Express API
```bash
node server.js
# POST http://localhost:3000/scan  { "text": "..." }
```

### 4. Run tests
```bash
npx jest
```

## Risk Logic

| Condition                  | Score  |
|----------------------------|--------|
| API key or credit card     | HIGH   |
| Email + password           | MEDIUM |
| Email or phone only        | LOW    |
"# DarkScan-Dark-Web-Leak-Detection" 
