# Real-Time Chat Application with Sentiment Analysis

A modern real-time chat application built with React, Express, and WebSockets that features asynchronous sentiment analysis of messages.

## Features

- **Real-time messaging** - Send and receive messages instantly using WebSockets
- **Sentiment analysis** - Messages are automatically analyzed for positive, negative, or neutral sentiment
- **Live updates** - Sentiment results appear in real-time without page refresh
- **User management** - Simple username-based system to join the chat
- **Modern UI** - Responsive design built with shadcn/ui components and Tailwind CSS
- **Connection status** - Visual indicators for connection status and online user count

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling
- TanStack Query for server state management
- Wouter for client-side routing
- WebSocket client for real-time communication

### Backend
- Node.js with Express.js framework
- TypeScript with ES modules
- WebSocket server for instant messaging
- RESTful API endpoints
- In-memory storage for messages and users
- Asynchronous sentiment analysis

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Extract the project files from the zip
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

This will start both the Express backend and Vite frontend development servers on the same port (5000).

Open your browser and navigate to `http://localhost:5000` to access the application.

### Usage

1. **Join the Chat**: Enter your name on the welcome screen
2. **Send Messages**: Type messages in the input field and press Enter or click Send
3. **View Sentiment**: Watch as sentiment analysis appears on messages after a 3-second delay:
   - 🟢 **Positive** - Messages containing words like "happy", "love", "great"
   - 🟡 **Neutral** - Messages that don't strongly lean positive or negative
   - 🔴 **Negative** - Messages containing words like "sad", "angry", "bad"
   - 🔵 **Analyzing...** - Initial state while sentiment is being processed

### API Endpoints

- `POST /api/message` - Send a new message
  - Body: `{ userId: string, username: string, text: string }`
- `GET /api/messages` - Retrieve all messages

### WebSocket Events

- `join` - Join the chat room
- `new_message` - Broadcast new message to all users
- `sentiment_update` - Update message sentiment in real-time
- `user_joined` / `user_left` - User connection status updates

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # shadcn/ui components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and query client
│   │   ├── pages/         # Application pages
│   │   └── App.tsx        # Main application component
│   └── index.html         # HTML template
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes and WebSocket handlers
│   ├── storage.ts        # In-memory storage implementation
│   └── vite.ts           # Vite middleware integration
├── shared/               # Shared TypeScript types
│   └── schema.ts        # Database schema and validation
└── package.json         # Project dependencies and scripts
```

## Sentiment Analysis

The application uses a simple keyword-based sentiment analysis algorithm:

- **Positive words**: happy, love, great, awesome, wonderful, excellent, amazing, fantastic, good, nice
- **Negative words**: sad, angry, bad, terrible, awful, hate, horrible, disgusting, worst, annoying
- **Processing**: Messages are analyzed after a 3-second delay to simulate real-world processing
- **Updates**: Sentiment results are broadcasted to all connected users in real-time

## Customization

### Adding More Sentiment Keywords
Edit the `analyzeSentiment` function in `server/routes.ts` to add more positive or negative keywords.

### Changing Processing Delay
Modify the `setTimeout` delay in `server/routes.ts` (currently 3000ms).

### Styling
Update colors and styling in `client/src/index.css` or modify Tailwind classes in components.

## Deployment

For production deployment:

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

The application will serve the built frontend files and API from the same Express server.


## Working flow 

**Step 1: Browser Request - What Happens When You Type localhost:5000**

1. Server Entry Point : Express server is listening on port 5000
2. Route Registration : Calls registerRoutes(app) to set up API and WebSocket routes
3. Vite Setup : In development, sets up Vite middleware to serve the React frontend
4. Reads client/index.html template 
5. Vite transforms the HTML and serves it
6. Ater the Vite setup, HTML template Creates root div where React app will mount and load the main react entry point

**Step 2: React Application Bootstrap**

7. Then all the imports done for react app, and when the route is '/' then it will render the chat component
8. showJoinScreen starts as true, so join screen displays first [Form with username input and "Join Chat" button, and Form has onSubmit={handleJoinChat} handler]
9. currentuser start as null in the starting and uses the react-query for fetching the messages

**Step 4: User Enters Name and Hits Enter - handleJoinChat Function**

10. prevent form from submission -> creates the user object with timestamp Id and trimmed username
11. currentuser state update and showjoinscreen state as true (hide form and show the messaging screen)

**Step 5: WebSocket Connection Triggered by currentUser Change**
12. when currentuser changes from null to a user object then useEffect triggers
13. Creates new WebSocket connection
14. Sends the join message with the user object on the server

**Step 6: Server Receives WebSocket Connection**

15.  When server receives join message, stores userId and username on WebSocket
16. Fetches all stored messages and sends them to the new user as initial_messages
17. Broadcasts user_joined event to ALL connected clients with username and online count


**Step 7: Client Receives Messages and Updates UI**

18. When receives initial_messages, sets the messages state
19. When receives user_joined, updates online count and shows toast notification

**Step 8: User Types and Sends a Message**

20. handleSendMessage function calls on the chat component, which prevent form from submission -> uses the react query mutation to make the post request to the api/message endpoint -> clears the input field

**Step 9: sendMessageMutation Makes API Call**

21. Uses apiRequest to make POST request to /api/message
22. Returns parsed JSON response and Makes fetch request to /api/message with JSON body

**Step 10: Server Handles POST /api/message**

23. server recieves the post request, stores the message in the memory with the pending sentiment
24. Immediately broadcasts message as new_message to all the connected users
25. Sets up 3-second delayed sentiment analysis using the settimeout -> server send the sentiment_update to the client 

**Step 11: Client Receives new_message and sentiment_update**

26. Adds new message to messages state array
27. Message appears immediately with "pending" sentiment (blue pulsing indicator) and When receives sentiment_update (3 seconds later)
28. Finds message by ID and updates its sentiment and UI immediately updates color indicator (green/yellow/red) and text


## Message Storage 

It uses the JavaScript Maps to store data in the server's memory (RAM) and when server restart all the data will be lost.

like this 

messages = Map {
  1 => {
    id: 1,
    userId: "1752910298765",
    username: "Alice",
    text: "Hello everyone!",
    sentiment: "pending",
    createdAt: 2025-01-19T10:30:00.000Z
  },
  2 => {
    id: 2,
    userId: "1752910319822",
    username: "Bob", 
    text: "This is great!",
    sentiment: "positive",  // Updated after sentiment analysis
    createdAt: 2025-01-19T10:31:00.000Z
  },
  3 => {
    id: 3,
    userId: "1752910298765",
    username: "Alice",
    text: "I'm feeling sad today",
    sentiment: "negative",  // Updated after sentiment analysis
    createdAt: 2025-01-19T10:32:00.000Z
  }
}

## Online User Count Feature

**Server Side** : Uses a JavaScript Set to store all active WebSocket connections and Each WebSocket represents one connected user

// Store connected clients
const clients = new Set<ChatWebSocket>();

wss.on('connection', (ws: ChatWebSocket) => {
  clients.add(ws);  // Add new connection to Set
  // ... later when user sends 'join' message:
  onlineCount: clients.size  // Send current count to all users
});

// User Leaves
ws.on('close', () => {
  clients.delete(ws);  // Remove connection from Set
  if (ws.username) {
    broadcast({
      type: 'user_left',
      username: ws.username,
      onlineCount: clients.size  // Send updated count
    });
  }
});


**Client-Side** : When user_joined message received, updates onlineCount state and When user_left message received, updates onlineCount state


## Message Count Implementation:

Simply shows the length of the messages array stored in React state and Updates automatically when new messages are added via WebSocket

## Leave Chat Functionality

1. Closes WebSocket connection if it exists
2. Clears all messages from local state
3. Shows join screen again (setShowJoinScreen(true))
4. Clears username input field

ws.on('close', () => {
  clients.delete(ws);  // Remove from connected clients Set
  if (ws.username) {
    broadcast({
      type: 'user_left',
      username: ws.username,
      onlineCount: clients.size  // Send updated count to remaining users
    });
  }
});
