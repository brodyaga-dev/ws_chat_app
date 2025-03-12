# WebSocket Chat Application

A real-time chat application built with TypeScript, React, Node.js, and WebSocket.

## Tech Stack

- **Frontend**: React.js with TypeScript, React Query
- **Backend**: Node.js, Express.js with TypeScript
- **Database**: MongoDB
- **WebSocket**: ws library
- **Containerization**: Docker
- **Package Management**: npm workspaces

## Project Structure

```
ws_chat_app/
├── apps/
│   ├── client/         # React frontend application
│   └── server/         # Node.js backend application
├── packages/
│   └── shared/         # Shared types and utilities
├── docker-compose.yml  # Docker composition file
└── package.json        # Root package file
```

## Prerequisites

- Docker and Docker Compose
- Node.js 20.x or later
- npm 8.x or later

## Getting Started

1. Clone the repository
2. Navigate to the project root directory

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the shared package:
   ```bash
   cd packages/shared
   npm run build
   cd ../..
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- MongoDB: mongodb://localhost:27017

### Development Commands

- Build all packages:
  ```bash
  npm run build
  ```

- Start development servers:
  ```bash
  npm run dev
  ```

- Run linting:
  ```bash
  npm run lint
  ```

## Environment Variables

### Server
- `MONGODB_URI`: MongoDB connection string (default: "mongodb://mongodb:27017/chat")
- `PORT`: Server port (default: 3001)

### Client
- `VITE_API_URL`: Backend API URL (default: "http://localhost:3001")
- `VITE_WS_URL`: WebSocket URL (default: "ws://localhost:3001")

## Features

- Real-time messaging using WebSocket
- Message persistence in MongoDB
- TypeScript support throughout the application
- Docker containerization for easy deployment
- Shared type definitions between frontend and backend

## Architecture

The application follows a monorepo structure using npm workspaces. It consists of three main packages:

1. **Client**: React application built with Vite
2. **Server**: Express.js application with WebSocket support
3. **Shared**: Common types and utilities used by both client and server

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
