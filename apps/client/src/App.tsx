import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Message, CreateMessage, WebSocketEvent } from '@ws-chat-app/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

function App() {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onmessage = (event) => {
      const wsEvent = JSON.parse(event.data) as WebSocketEvent;
      if (wsEvent.type === 'NEW_MESSAGE') {
        queryClient.setQueryData<Message[]>(['messages'], (oldMessages = []) => {
          return [wsEvent.payload, ...oldMessages];
        });
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => setWs(null), 5000);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [queryClient]);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
  });

  // Create message mutation
  const createMessage = useMutation({
    mutationFn: async (newMessage: CreateMessage) => {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });
      if (!response.ok) throw new Error('Failed to send message');
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim()) return;

      try {
        await createMessage.mutateAsync({ content: message });
        setMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [message, createMessage]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Chat App</h1>
      
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" disabled={createMessage.isPending} className="send-button">
          Send
        </button>
      </form>

      <div className="messages">
        {messages.map((msg) => (
          <div key={msg._id} className="message">
            <p>{msg.content}</p>
            <small>{new Date(msg.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <style>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .message-form {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .message-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }

        .send-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .send-button:disabled {
          background-color: #ccc;
        }

        .messages {
          display: flex;
          flex-direction: column-reverse;
          gap: 10px;
        }

        .message {
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }

        .message p {
          margin: 0 0 5px 0;
        }

        .message small {
          color: #6c757d;
        }
      `}</style>
    </div>
  );
}

export default App; 