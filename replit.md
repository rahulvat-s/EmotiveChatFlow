# Real-time Chat Application

## Overview

This is a full-stack real-time chat application built with React, Express, WebSockets, and PostgreSQL. The application features real-time messaging with sentiment analysis, user management, and a modern UI built with shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket client for live chat functionality

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Real-time**: WebSocket server for instant messaging
- **API**: RESTful endpoints for HTTP operations
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reloading with Vite middleware integration

### Data Storage
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL driver
- **Migrations**: Drizzle Kit for schema management
- **Fallback**: In-memory storage implementation for development

## Key Components

### Authentication & User Management
- Simple username-based user system
- Session-based authentication
- User creation and lookup functionality
- No password authentication (simplified for demo)

### Real-time Messaging
- WebSocket connection on `/ws` endpoint
- Bidirectional communication between clients
- Real-time message broadcasting to all connected users
- Connection status and online user count tracking

### Sentiment Analysis
- Built-in sentiment analysis for chat messages
- Classifies messages as positive, negative, or neutral
- Real-time sentiment updates via WebSocket
- Simple keyword-based analysis algorithm

### UI Components
- Modern chat interface with message bubbles
- Real-time typing indicators and connection status
- Responsive design for mobile and desktop
- Dark/light theme support via CSS variables
- Toast notifications for user feedback

## Data Flow

1. **User Join**: User enters username → Creates user record → Establishes WebSocket connection
2. **Message Send**: User types message → Validates input → Sends via WebSocket → Stores in database
3. **Message Broadcast**: Server receives message → Analyzes sentiment → Broadcasts to all clients → Updates UI
4. **Sentiment Update**: Background sentiment analysis → Updates message record → Notifies clients via WebSocket

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting
- **Connection Pooling**: Built-in connection management
- **Environment**: Requires `DATABASE_URL` environment variable

### UI Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library with consistent design

### Development Tools
- **Replit Integration**: Custom plugins for Replit environment
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- WebSocket server integrated with HTTP server
- Automatic database schema synchronization

### Production
- Static frontend build served by Express
- Single Node.js process handling HTTP and WebSocket
- Environment-based configuration
- Database migrations via Drizzle Kit

### Build Process
1. Frontend: Vite builds React app to `dist/public`
2. Backend: ESBuild bundles server code to `dist/index.js`
3. Database: Drizzle pushes schema changes to PostgreSQL
4. Deployment: Single Node.js process serves everything

### Environment Requirements
- Node.js environment with ES module support
- PostgreSQL database with connection URL
- WebSocket-compatible hosting platform
- Static file serving capabilities