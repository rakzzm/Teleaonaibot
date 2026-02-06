import { Router } from 'express';

const router = Router();

interface TestConnectionRequest {
  provider: string;
  apiKey: string;
  apiBase?: string;
}

// Test provider connection
router.post('/test', async (req, res) => {
  try {
    const { provider, apiKey, apiBase } = req.body as TestConnectionRequest;

    if (!provider || !apiKey) {
      return res.status(400).json({ success: false, message: 'Provider and API key are required' });
    }

    // Get the appropriate endpoint for testing
    const testEndpoints: Record<string, string> = {
      openrouter: 'https://openrouter.ai/api/v1/models',
      anthropic: 'https://api.anthropic.com/v1/models',
      openai: 'https://api.openai.com/v1/models',
      groq: 'https://api.groq.com/openai/v1/models',
      deepseek: 'https://api.deepseek.com/v1/models',
      gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
    };

    const baseUrl = apiBase || testEndpoints[provider];
    if (!baseUrl) {
      return res.status(400).json({ success: false, message: 'Unknown provider' });
    }

    // Make a test request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Different providers use different auth headers
    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else if (provider === 'gemini') {
      // Gemini uses query param for API key
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Ensure we append /models for Gemini if it's just the base URL
    // And handle the case where baseUrl already ends with /models
    let testUrl = baseUrl;
    if (provider === 'gemini') {
      if (!testUrl.includes('/models')) {
        testUrl = `${testUrl.replace(/\/$/, '')}/models`;
      }
      testUrl = `${testUrl}?key=${apiKey}`;
    } else {
      testUrl = baseUrl.includes('/models') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/models`;
    }

    console.log(`[Providers] Testing ${provider} at ${testUrl.replace(apiKey, '***')}`);

    const response = await fetch(testUrl, { headers });

    if (response.ok) {
      return res.json({ success: true, message: 'Connection successful!' });
    } else {
      const errorText = await response.text();
      let errorMessage = `Connection failed: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += ` - ${errorJson.error?.message || errorJson.message || errorText.slice(0, 100)}`;
      } catch {
        errorMessage += ` - ${errorText.slice(0, 100)}`;
      }
      return res.json({ success: false, message: errorMessage });
    }
  } catch (error) {
    console.error('Provider test error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message: `Test failed: ${message}` });
  }
});

export default router;
