import { Router } from 'express';
import { callAI, type ChatMessage } from '../services/ai.js';

const router = Router();

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  apiKey?: string;
  provider?: string;
}

// Chat completion endpoint
router.post('/completion', async (req, res) => {
  try {
    const { messages, model, apiKey, provider } = req.body as ChatRequest;
    
    console.log(`[Chat] Request received: Provider=${provider}, Model=${model}, APIKey=${apiKey ? '***' + apiKey.slice(-4) : 'MISSING'}`);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await callAI({
      messages,
      model: model || 'anthropic/claude-sonnet-4',
      apiKey,
      provider: provider || 'openrouter',
    });

    return res.json(response);
  } catch (error) {
    console.error('Chat completion error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: message });
  }
});

// Streaming chat completion (SSE)
router.post('/stream', async (req, res) => {
  try {
    const { messages, model, apiKey, provider } = req.body as ChatRequest;

    if (!messages || !apiKey) {
      return res.status(400).json({ error: 'Messages and API key are required' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await callAI({
      messages,
      model: model || 'anthropic/claude-sonnet-4',
      apiKey,
      provider: provider || 'openrouter',
      stream: true,
    });

    // Send the response as SSE
    res.write(`data: ${JSON.stringify(response)}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  } catch (error) {
    console.error('Stream error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    return res.end();
  }
});

export default router;
