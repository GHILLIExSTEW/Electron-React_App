# Electron React Python Service Manager

A modern, minimal Electron desktop app with a React frontend to start/stop three Python services and monitor their logs in real time.

## Features
- Start/stop/restart three Python scripts as services
- Real-time log streaming for each service
- Modern, minimal UI (React + Vite)
- Node.js backend for process management and log streaming

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app in development mode:
   ```bash
   npm run dev:electron
   ```

## Project Structure
- `src/` - React frontend
- `main/` - Electron main process (Node.js backend)
- `public/` - Static assets

## Service Scripts
- Configure the paths to your three Python scripts in the Electron main process code.

## Build
To package the app for Windows:
```bash
npm run build
npm run build:electron
```

---

MIT License
