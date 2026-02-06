export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: ChatMessage[];
  model: string;
  apiKey: string;
  provider: string;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// OpenRouter API (supports multiple providers)
async function callOpenRouter(request: AIRequest): Promise<AIResponse> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${request.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://teleaon.ai',
      'X-Title': 'Teleaon Bot',
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0]?.message?.content || '',
    model: data.model || request.model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  };
}

// Direct Anthropic API
async function callAnthropic(request: AIRequest): Promise<AIResponse> {
  // Map model names
  let model = request.model;
  
  // If model is for another provider, use a default Anthropic model
  if (model.includes('/') && !model.startsWith('anthropic/')) {
    model = 'claude-3-5-sonnet-20240620';
  } else {
    model = model.replace('anthropic/', '');
  }

  // Handle specific version mapping if needed
  if (model === 'claude-opus-4-5') model = 'claude-3-opus-20240229';
  if (model === 'claude-sonnet-4') model = 'claude-3-5-sonnet-20240620';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': request.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: request.messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role,
        content: m.content,
      })),
      system: request.messages.find(m => m.role === 'system')?.content,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.content[0]?.text || '',
    model: data.model || model,
    usage: data.usage ? {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    } : undefined,
  };
}

// Direct OpenAI API
async function callOpenAI(request: AIRequest): Promise<AIResponse> {
  // Map model names
  let model = request.model;
  
  // If model is for another provider, use a default OpenAI model
  if (model.includes('/') && !model.startsWith('openai/')) {
    model = 'gpt-4o';
  } else {
    model = model.replace('openai/', '');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${request.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: request.messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0]?.message?.content || '',
    model: data.model || model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  };
}

// Direct Google Gemini API
async function callGemini(request: AIRequest): Promise<AIResponse> {
  const tryModel = async (modelId: string, version: 'v1' | 'v1beta'): Promise<AIResponse> => {
    const baseUrl = `https://generativelanguage.googleapis.com/${version}/models`;
    const url = `${baseUrl}/${modelId}:generateContent?key=${request.apiKey}`;
    
    console.log(`[Gemini] Attempting ${modelId} on ${version}...`);

    const systemMessage = request.messages.find(m => m.role === 'system');
    const otherMessages = request.messages.filter(m => m.role !== 'system');

    const body: Record<string, any> = {
      contents: otherMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      generationConfig: {
        maxOutputTokens: 2048,
      }
    };

    if (systemMessage) {
      body.system_instruction = {
        parts: [{ text: systemMessage.content }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw { status: response.status, message: error, modelId, version };
    }

    const data = await response.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      model: data.modelVersion || modelId,
    };
  };

  // Map requested model
  let requestedModel = request.model.replace('google/', '');
  if (requestedModel.includes('gemini-2.0-flash')) requestedModel = 'gemini-2.0-flash-exp';
  
  try {
    // Attempt 1: Requested model on v1beta
    return await tryModel(requestedModel, 'v1beta');
  } catch (err: any) {
    if (err.status === 404) {
      console.log(`[Gemini] Model ${requestedModel} (v1beta) not found. Trying fallback...`);
      try {
        // Attempt 2: Fallback to stable 1.5-flash on v1
        return await tryModel('gemini-1.5-flash', 'v1');
      } catch (err2: any) {
        console.error(`[Gemini] Fallback failed. Final error:`, err2);
        
        // Diagnostic: List models as a last resort to see what's available
        try {
          const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${request.apiKey}`;
          const listRes = await fetch(listUrl);
          if (listRes.ok) {
            const listData = await listRes.json();
            const modelNames = listData.models?.map((m: any) => m.name) || [];
            console.log(`[Gemini] DIAGNOSTIC - Available models for this key:`, modelNames);
          }
        } catch (diagErr) {
          console.error(`[Gemini] Diagnostic ListModels failed:`, diagErr);
        }

        throw new Error(`Gemini API error: ${err.status} - ${err.message}`);
      }
    }
    throw new Error(`Gemini API error: ${err.status} - ${err.message}`);
  }
}

// Main AI call function - routes to appropriate provider
export async function callAI(request: AIRequest): Promise<AIResponse> {
  const provider = request.provider.toLowerCase();

  switch (provider) {
    case 'openrouter':
      return callOpenRouter(request);
    case 'anthropic':
      return callAnthropic(request);
    case 'openai':
      return callOpenAI(request);
    case 'gemini':
      return callGemini(request);
    case 'groq':
      // Groq uses OpenAI-compatible API
      return callOpenAICompatible(request, 'https://api.groq.com/openai/v1/chat/completions');
    case 'deepseek':
      // DeepSeek uses OpenAI-compatible API
      return callOpenAICompatible(request, 'https://api.deepseek.com/v1/chat/completions');
    default:
      // If provider is unknown, it falls through to OpenRouter but with a clear error prefix if it fails
      try {
        return await callOpenRouter(request);
      } catch (error) {
        throw new Error(`Unknown provider "${request.provider}" fell back to OpenRouter and failed: ${error instanceof Error ? error.message : String(error)}`);
      }
  }
}

// Generic OpenAI-compatible API caller
async function callOpenAICompatible(request: AIRequest, endpoint: string): Promise<AIResponse> {
  // Map model names
  let model = request.model;
  const provider = request.provider.toLowerCase();
  
  // If model is for another provider, use a default for this provider
  if (model.includes('/') && !model.startsWith(`${provider}/`)) {
    // Default models for specific providers
    if (provider === 'groq') model = 'llama-3.1-70b-versatile';
    else if (provider === 'deepseek') model = 'deepseek-chat';
    else model = model.split('/').pop() || model; // Try to use just the model name
  } else {
    model = model.replace(`${provider}/`, '');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${request.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: request.messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0]?.message?.content || '',
    model: data.model || request.model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  };
}
