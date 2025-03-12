import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { MongoClient, ObjectId } from 'mongodb';
import { CreateMessageSchema, WebSocketEvent } from '@ws-chat-app/shared';

type MessageDB = {
  _id: ObjectId;
  content: string;
  createdAt: string;
};

type Message = {
  _id: string;
  content: string;
  createdAt: string;
};

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const port = process.env.PORT || 3001;

// MongoDB setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(MONGODB_URI);
const dbName = 'chat-app';
const messagesCollection = 'messages';

// Message batch processing
let messageBatch: Array<Omit<MessageDB, '_id'>> = [];
let batchTimeout: NodeJS.Timeout | null = null;

const processBatch = async () => {
  if (messageBatch.length === 0) return;

  const batchToProcess = [...messageBatch];
  messageBatch = [];

  try {
    const db = client.db(dbName);
    const result = await db.collection(messagesCollection).insertMany(batchToProcess);
    console.log(`Processed batch of ${batchToProcess.length} messages`);
  } catch (error) {
    console.error('Error processing batch:', error);
    // Re-add failed messages to the batch
    messageBatch = [...batchToProcess, ...messageBatch];
  }
};

const scheduleBatchProcessing = () => {
  if (batchTimeout) clearTimeout(batchTimeout);
  batchTimeout = setTimeout(processBatch, 1000);
};

// WebSocket broadcast
const broadcast = (event: WebSocketEvent) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(event));
    }
  });
};

// Poll for new messages
let lastMessageId: ObjectId | null = null;

const pollNewMessages = async () => {
  try {
    const db = client.db(dbName);
    const query = lastMessageId ? { _id: { $gt: lastMessageId } } : {};
    
    const messages = await db
      .collection<MessageDB>(messagesCollection)
      .find(query)
      .sort({ _id: 1 })
      .toArray();

    const formattedMessages: Message[] = messages.map(msg => ({
      ...msg,
      _id: msg._id.toString()
    }));

    if (messages.length > 0) {
      lastMessageId = messages[messages.length - 1]._id;
      formattedMessages.forEach((message) => {
        broadcast({
          type: 'NEW_MESSAGE',
          payload: message,
        });
      });
    }
  } catch (error) {
    console.error('Error polling messages:', error);
  }
};

const startPolling = () => {
  setInterval(pollNewMessages, 1000);
};

// Express middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/messages', async (req, res) => {
  try {
    const createMessage = CreateMessageSchema.parse(req.body);
    const message = {
      ...createMessage,
      createdAt: new Date().toISOString(),
    };

    messageBatch.push(message);

    if (messageBatch.length >= 10) {
      await processBatch();
    } else {
      scheduleBatchProcessing();
    }

    res.status(202).json({ message: 'Message queued for processing' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid message format' });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const db = client.db(dbName);
    const messages = await db
      .collection<MessageDB>(messagesCollection)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(messages.map(msg => ({ ...msg, _id: msg._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Start server
const startServer = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    startPolling();
    console.log('Started polling for new messages');

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 