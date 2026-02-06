import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import providersRouter from './routes/providers.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (_req, res) => {
  res.send('<h1>🚀 Teleaon Bot API Server</h1><p>The server is running! Use <code>/api/health</code> to check status.</p>');
});

app.use('/api/chat', chatRouter);
app.use('/api/providers', providersRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Teleaon Bot API Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
