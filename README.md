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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.