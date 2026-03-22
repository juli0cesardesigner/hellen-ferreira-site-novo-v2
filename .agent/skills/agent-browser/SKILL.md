---
name: agent-browser
description: Advanced browser automation skill for AI agents. Enables navigation, data extraction, and complex interaction flows.
tags: [automation, browser, scraping, testing]
version: 1.0.0
---

# Browser Automation with agent-browser

Master browser automation tasks including navigation, snapshotting, elements interaction, and authentication.

## Goal
Automate web tasks such as site navigation, form filling, data extraction, and authenticated session management.

## Requirements
- `agent-browser` tool installed/available.
- Correct permissions for network access.

## Steps

### 1. Basic Navigation & Discovery
Navigate to a URL and discover interactive elements.
```bash
agent-browser open <url>
agent-browser snapshot -i
```

### 2. Interaction
Use the generated refs (e.g., `@e1`) to interact with the page.
```bash
agent-browser fill @e1 "input value"
agent-browser click @e2
agent-browser wait --load networkidle
```

### 3. Handle Authentication
Save and load sessions to maintain login states.
```bash
agent-browser state save auth.json
# or use named sessions
agent-browser --session-name myapp open <url>
```

### 4. Data Extraction
Retrieve text or screenshots for verification.
```bash
agent-browser get text @e3
agent-browser screenshot --annotate
```

## Verification
- [ ] Navigation is successful and the correct page state is reached.
- [ ] Forms are submitted and success messages are verified using `get text`.
- [ ] Screenshots confirm visual state if necessary.
