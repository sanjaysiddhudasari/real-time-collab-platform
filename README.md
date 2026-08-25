# Real-Time Collaborative Coding Platform

A full-stack collaborative coding environment where multiple users can work in the same room, edit files together in real time, run code, discuss code with persistent comments, and get AI-powered code reviews.

## Features

### Real-time collaboration

- Create and join collaborative coding rooms
- Multi-user code editing with Monaco Editor
- Real-time code synchronization using Socket.IO
- Remote cursor presence with per-user cursor colors
- Multi-file workspace with file creation, rename, delete, and language selection
- Room presence and participant information

### Code execution

- Run the active source file from the room
- Supports JavaScript, Python, Java, C++, and TypeScript files used by the editor
- Streaming execution output to connected room members
- Running state is scoped to the active file

### AI code review

- AI-powered review through the DeepSeek API using the OpenAI-compatible SDK
- Streaming review responses over Server-Sent Events (SSE)
- Reviews are displayed directly beside the editor
- Monaco decorations can highlight reviewed code locations

### Code comments

- Add comments to specific code locations
- Reply to existing comments
- Resolve comments when an issue is addressed
- Comments are persisted and synchronized for the room

### Authentication

- JWT-based authentication
- HTTP-only cookie authentication
- Protected room and collaboration APIs
- Socket.IO authentication using the JWT cookie/token

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Monaco Editor
- Socket.IO Client
- Axios
- React Router

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- Socket.IO
- JWT
- Helmet
- Cookie Parser
- DeepSeek API through the OpenAI SDK

## Architecture

```text
                         ┌─────────────────────┐
                         │      React/Vite     │
                         │   Monaco Editor     │
                         └──────────┬──────────┘
                                    │
                    HTTP / SSE      │      Socket.IO
                                    │
                         ┌──────────▼──────────┐
                         │    Express Server   │
                         │                     │
                         │ REST APIs           │
                         │ AI Review / SSE     │
                         │ Authentication      │
                         │ Socket.IO           │
                         └───────┬──────┬──────┘
                                 │      │
                    ┌────────────┘      └──────────────┐
                    ▼                                   ▼
             ┌──────────────┐                   ┌──────────────┐
             │   MongoDB    │                   │  DeepSeek AI │
             │              │                   │              │
             │ Users        │                   │ Streaming    │
             │ Rooms        │                   │ code review  │
             │ Files        │                   └──────────────┘
             │ Messages     │
             │ Comments     │
             └──────────────┘
```

## Project Structure

```text
real-time-collab-platform/
├── client/                 # React/Vite frontend
│   ├── src/
│   │   ├── components/     # Room, editor, comments, UI components
│   │   ├── hooks/           # Collaboration and feature hooks
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API clients
│   │   └── socket/          # Socket.IO client setup
│   └── package.json
│
├── server/                 # Express/Socket.IO backend
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .env.example
└── package.json
```

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB / MongoDB Atlas
- A DeepSeek API key for AI review
- Docker Engine is required by the current code-execution implementation when running code through the backend

### 1. Clone the repository

```bash
git clone https://github.com/sanjaysiddhudasari/real-time-collab-platform.git
cd real-time-collab-platform
```

### 2. Install dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd ../client
npm install
```

### 3. Configure environment variables

Create the backend environment file from the example:

```bash
cd ../server
cp ../.env.example .env
```

Configure the values for your environment. The important variables include:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:5173
DEEPSEEK_API_KEY=your-deepseek-api-key
```

If Google OAuth is enabled in your local setup, also configure the Google OAuth variables from `.env.example`.

Never commit `.env` or API keys to Git.

### 4. Start the backend

```bash
cd server
npm start
```

The backend uses `process.env.PORT` when provided and falls back to port `5000` for local development.

### 5. Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

Open the Vite development URL shown in the terminal, normally:

```text
http://localhost:5173
```

## Environment Variables

The repository contains `.env.example` as a reference for the backend configuration.

| Variable | Purpose |
|---|---|
| `PORT` | Backend listening port; local default is `5000` |
| `NODE_ENV` | Runtime environment |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `CLIENT_URL` | Allowed frontend origin for HTTP and Socket.IO CORS |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID, if OAuth is enabled |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret, if OAuth is enabled |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL |
| `DEEPSEEK_API_KEY` | API key used for AI code review |

## AI Review Flow

The AI review endpoint follows this flow:

```text
Frontend
   │
   │ POST /api/ai/review
   ▼
JWT middleware
   │
   ▼
Prompt builder
   │
   ▼
DeepSeek API (streaming)
   │
   ▼
Server-Sent Events
   │
   ▼
AI suggestion panel
```

The frontend uses `fetch()` for the streaming response rather than Axios, and appends SSE chunks as they arrive.

## Real-Time Collaboration Flow

Socket.IO is used for room-level real-time events such as:

- Joining/leaving rooms
- Code synchronization
- Cursor movement
- File operations
- Room presence
- Messages
- Code execution state and output
- Comment-related collaboration events

The backend authenticates Socket.IO connections using the JWT cookie/token before allowing room operations.

## Production Deployment

The application can be deployed without Docker.

A simple deployment setup is:

```text
Frontend  → Vercel
Backend   → Render / Railway
Database  → MongoDB Atlas
```

Before deploying:

1. Replace all local/LAN API URLs with environment variables.
2. Set `VITE_API_URL` on the frontend to the deployed backend URL.
3. Set `CLIENT_URL` on the backend to the deployed frontend URL.
4. Configure production cookie settings (`secure` and `sameSite`) for cross-site authentication.
5. Configure Socket.IO CORS with the deployed frontend origin.
6. Add `MONGO_URI`, `JWT_SECRET`, and `DEEPSEEK_API_KEY` as deployment secrets.
7. Verify that the deployment environment supports the current code-execution implementation.

Do not commit production secrets to the repository.

## API Overview

Main backend areas include:

```text
/api/auth       Authentication
/api/rooms      Room management
/api/messages   Messages
/api/ai         AI review
/api/comments   Persistent code comments
```

## What This Project Demonstrates

- Real-time state synchronization with WebSockets
- Collaborative editor architecture using Monaco Editor
- REST API design with Express
- JWT authentication and protected resources
- MongoDB data modeling with Mongoose
- Streaming LLM responses with SSE
- AI-assisted code review
- Persistent, location-aware code discussions
- Separation of frontend feature logic into reusable React hooks
- Production-oriented environment and deployment configuration

## Future Ideas

Possible future improvements include session replay, richer version history, Git integration, and additional collaboration features. These are intentionally kept separate from the current core implementation.

## License

This project currently does not declare a specific open-source license.
