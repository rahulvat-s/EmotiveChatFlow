import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message } from "@shared/schema";

interface User {
  id: string;
  name: string;
}

interface WebSocketMessage {
  type: string;
  message?: Message;
  messages?: Message[];
  messageId?: number;
  sentiment?: string;
  username?: string;
  onlineCount?: number;
}

export default function Chat() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [showJoinScreen, setShowJoinScreen] = useState(true);
  const [username, setUsername] = useState("");
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch initial messages
  const { data: initialMessages } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !showJoinScreen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { userId: string; username: string; text: string }) => {
      const response = await apiRequest('POST', '/api/message', messageData);
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Initialize WebSocket connection
  useEffect(() => {
    if (!currentUser) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "You're now connected to the chat",
      });
      
      // Join the chat
      ws.send(JSON.stringify({
        type: 'join',
        userId: currentUser.id,
        username: currentUser.name
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case 'initial_messages':
            if (data.messages) {
              setMessages(data.messages);
            }
            break;
            
          case 'new_message':
            if (data.message) {
              setMessages(prev => [...prev, data.message!]);
            }
            break;
            
          case 'sentiment_update':
            if (data.messageId && data.sentiment) {
              setMessages(prev => prev.map(msg => 
                msg.id === data.messageId 
                  ? { ...msg, sentiment: data.sentiment! }
                  : msg
              ));
            }
            break;
            
          case 'user_joined':
            if (data.onlineCount) {
              setOnlineCount(data.onlineCount);
            }
            if (data.username && data.username !== currentUser.name) {
              toast({
                title: "User Joined",
                description: `${data.username} joined the chat`,
              });
            }
            break;
            
          case 'user_left':
            if (data.onlineCount) {
              setOnlineCount(data.onlineCount);
            }
            if (data.username) {
              toast({
                title: "User Left",
                description: `${data.username} left the chat`,
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Connection to chat lost",
        variant: "destructive",
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [currentUser, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set initial messages from query
  useEffect(() => {
    if (Array.isArray(initialMessages) && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length]);

  const handleJoinChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      const user: User = {
        id: Date.now().toString(),
        name: username.trim()
      };
      setCurrentUser(user);
      setShowJoinScreen(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const messageData = {
      userId: currentUser.id,
      username: currentUser.name,
      text: newMessage.trim()
    };

    try {
      await sendMessageMutation.mutateAsync(messageData);
      setNewMessage("");
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleLeaveChat = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setCurrentUser(null);
    setMessages([]);
    setShowJoinScreen(true);
    setUsername("");
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      case 'neutral': return 'bg-amber-500';
      case 'pending': return 'bg-cyan-500 animate-pulse';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'Positive';
      case 'negative': return 'Negative';
      case 'neutral': return 'Neutral';
      case 'pending': return 'Analyzing...';
      default: return 'Unknown';
    }
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-red-500 to-pink-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-indigo-600',
      'from-teal-500 to-cyan-600'
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (showJoinScreen) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">RealTime Chat</h1>
              <p className="text-gray-600">Join the conversation with sentiment analysis</p>
            </div>
            
            <form onSubmit={handleJoinChat} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your name to join"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Join Chat
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Positive
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  Neutral
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Negative
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Messages are analyzed for sentiment in real-time</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Global Chat</h1>
            <div className="flex items-center text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            <span>{currentUser?.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveChat}
            className="text-gray-500 hover:text-red-500"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* System Message */}
        <div className="text-center">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Welcome to the chat! Messages are analyzed for sentiment.
          </Badge>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${getAvatarColor(message.username)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
              {message.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-gray-900 text-sm">{message.username}</span>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${getSentimentColor(message.sentiment)}`}></div>
                  <span className={`text-xs font-medium ${
                    message.sentiment === 'positive' ? 'text-green-700' :
                    message.sentiment === 'negative' ? 'text-red-700' :
                    message.sentiment === 'neutral' ? 'text-amber-700' :
                    'text-cyan-700'
                  }`}>
                    {getSentimentText(message.sentiment)}
                  </span>
                </div>
              </div>
              <Card className="bg-white shadow-sm border border-gray-100">
                <CardContent className="p-4">
                  <p className="text-gray-800">{message.text}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="rounded-full"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-full p-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </Button>
        </form>
        
        {/* Message Stats */}
        <div className="flex items-center justify-center mt-3 space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>{onlineCount} online</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span>{messages.length} messages</span>
          </div>
        </div>
      </div>
    </div>
  );
}
