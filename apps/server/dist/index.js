"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const http_1 = require("http");
const mongodb_1 = require("mongodb");
const shared_1 = require("@ws-chat-app/shared");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
const port = process.env.PORT || 3001;
// MongoDB setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new mongodb_1.MongoClient(MONGODB_URI);
const dbName = 'chat-app';
const messagesCollection = 'messages';
// Message batch processing
let messageBatch = [];
let batchTimeout = null;
const processBatch = async () => {
    if (messageBatch.length === 0)
        return;
    const batchToProcess = [...messageBatch];
    messageBatch = [];
    try {
        const db = client.db(dbName);
        const result = await db.collection(messagesCollection).insertMany(batchToProcess);
        console.log(`Processed batch of ${batchToProcess.length} messages`);
    }
    catch (error) {
        console.error('Error processing batch:', error);
        // Re-add failed messages to the batch
        messageBatch = [...batchToProcess, ...messageBatch];
    }
};
const scheduleBatchProcessing = () => {
    if (batchTimeout)
        clearTimeout(batchTimeout);
    batchTimeout = setTimeout(processBatch, 1000);
};
// WebSocket broadcast
const broadcast = (event) => {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(event));
        }
    });
};
// MongoDB Change Stream
const watchChanges = async () => {
    const db = client.db(dbName);
    const changeStream = db.collection(messagesCollection).watch();
    changeStream.on('change', (change) => {
        if (change.operationType === 'insert') {
            const message = change.fullDocument;
            broadcast({
                type: 'NEW_MESSAGE',
                payload: message,
            });
        }
    });
};
// Express middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.post('/messages', async (req, res) => {
    try {
        const createMessage = shared_1.CreateMessageSchema.parse(req.body);
        const message = {
            ...createMessage,
            createdAt: new Date().toISOString(),
        };
        messageBatch.push(message);
        if (messageBatch.length >= 10) {
            await processBatch();
        }
        else {
            scheduleBatchProcessing();
        }
        res.status(202).json({ message: 'Message queued for processing' });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid message format' });
    }
});
app.get('/messages', async (req, res) => {
    try {
        const db = client.db(dbName);
        const messages = await db
            .collection(messagesCollection)
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
// Start server
const startServer = async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        await watchChanges();
        console.log('Watching for MongoDB changes');
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
