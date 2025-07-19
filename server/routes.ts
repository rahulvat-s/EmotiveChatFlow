import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";

interface ChatWebSocket extends WebSocket {
  userId?: string;
  username?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server on /ws path to avoid conflict with Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Set<ChatWebSocket>();
  
  // Sentiment analysis function
  function analyzeSentiment(text: string): string {
    const lowerText = text.toLowerCase();
    const positiveWords = ['happy', 'love', 'great', 'awesome', 'wonderful', 'excellent', 'amazing', 'fantastic', 'good', 'nice'];
    const negativeWords = ['sad', 'angry', 'bad', 'terrible', 'awful', 'hate', 'horrible', 'disgusting', 'worst', 'annoying'];
    
    const hasPositive = positiveWords.some(word => lowerText.includes(word));
    const hasNegative = negativeWords.some(word => lowerText.includes(word));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    if (hasPositive && hasNegative) return 'neutral';
    return 'neutral';
  }
  
  // Broadcast message to all connected clients
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  // WebSocket connection handler
  wss.on('connection', (ws: ChatWebSocket) => {
    clients.add(ws);
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join') {
          ws.userId = message.userId;
          ws.username = message.username;
          
          // Send recent messages to newly connected user
          const recentMessages = await storage.getMessages();
          ws.send(JSON.stringify({
            type: 'initial_messages',
            messages: recentMessages
          }));
          
          // Broadcast user joined
          broadcast({
            type: 'user_joined',
            username: message.username,
            onlineCount: clients.size
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
      if (ws.username) {
        broadcast({
          type: 'user_left',
          username: ws.username,
          onlineCount: clients.size
        });
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });
  
  // POST /api/message endpoint
  app.post('/api/message', async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      
      // Store message with pending sentiment
      const message = await storage.createMessage(validatedData);
      
      // Broadcast message immediately with pending sentiment
      broadcast({
        type: 'new_message',
        message
      });
      
      // Simulate asynchronous sentiment analysis (3 second delay)
      setTimeout(async () => {
        const sentiment = analyzeSentiment(message.text);
        const updatedMessage = await storage.updateMessageSentiment(message.id, sentiment);
        
        if (updatedMessage) {
          // Broadcast sentiment update
          broadcast({
            type: 'sentiment_update',
            messageId: message.id,
            sentiment
          });
        }
      }, 3000);
      
      res.json({ success: true, message });
    } catch (error) {
      console.error('Message creation error:', error);
      res.status(400).json({ error: 'Invalid message data' });
    }
  });
  
  // GET /api/messages endpoint
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error('Messages fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  return httpServer;
}
