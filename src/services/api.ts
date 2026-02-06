const API_BASE = '/api';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  apiKey: string;
  provider?: string;
}

export interface ChatCompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

// Send chat completion request
export async function sendChatMessage(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  try {
    const response = await fetch(`${API_BASE}/chat/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        content: '',
        model: request.model || 'unknown',
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return {
      content: '',
      model: request.model || 'unknown',
      error: message,
    };
  }
}

// Test provider connection
export async function testProviderConnection(
  provider: string,
  apiKey: string,
  apiBase?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/providers/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider, apiKey, apiBase }),
    });

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { success: false, message };
  }
}

// Check API health
export async function checkHealth(): Promise<{ status: string; timestamp: string } | null> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}
