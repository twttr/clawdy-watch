# Clawdy Watch 🦝⌚

Zepp OS mini app for Amazfit Active 2 that integrates with Clawdbot.

## Features

- **Status Dashboard** - Weather, next event, unread emails
- **Quick Actions** - Send commands to Clawdbot
- **Notifications** - (TODO) Push notifications from Clawdbot

## Setup

### 1. Install Zeus CLI

```bash
npm install -g @zeppos/zeus-cli
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure API endpoint

Edit `app-side/index.js` and update:
```javascript
const CONFIG = {
  apiBase: 'https://your-server.com/api/watch',
  authToken: 'your-secret-token'
}
```

### 4. Enable Developer Mode on Zepp App

- Open Zepp App on your phone
- Go to Profile → Settings → About
- Tap "About" 7 times to enable Developer Mode
- Go to Developer Mode settings and enable it

### 5. Build & Preview

```bash
# Build the app
zeus build

# Preview on device (scan QR with Zepp App)
zeus preview
```

## API Endpoints (Server Side)

Your Clawdbot server should implement:

### GET /api/watch/status
Returns:
```json
{
  "weather": "5°C Cloudy",
  "nextEvent": "Meeting at 15:00",
  "unreadEmails": 3
}
```

### POST /api/watch/command
Body:
```json
{
  "command": "ping|lights_toggle|tts_test|check_email",
  "timestamp": 1706736000000
}
```

## Project Structure

```
clawdy-watch/
├── app.json          # App config
├── app.js            # App entry point
├── page/
│   ├── home/         # Main dashboard
│   │   └── index.js
│   └── actions/      # Quick actions
│       └── index.js
├── app-side/         # Side Service (runs on phone)
│   └── index.js
└── assets/           # Icons, images
```

## Development

```bash
# Watch mode with hot reload
zeus dev

# Build for production
zeus build --release
```

## TODO

- [ ] Add notification support
- [ ] Heart rate widget
- [ ] Custom action editor
- [ ] Better error handling
- [ ] Offline mode with cached data
