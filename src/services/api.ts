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
  const provider = request.provider?.toLowerCase();

  // Route Gemini to direct integration if requested
  if (provider === 'gemini') {
    return callGeminiDirectly(request);
  }

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

// Direct Gemini API call from frontend
async function callGeminiDirectly(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  const tryModel = async (modelId: string, version: 'v1' | 'v1beta'): Promise<ChatCompletionResponse> => {
    const baseUrl = `https://generativelanguage.googleapis.com/${version}/models`;
    const url = `${baseUrl}/${modelId}:generateContent?key=${request.apiKey}`;
    
    const systemMessage = request.messages.find(m => m.role === 'system');
    const otherMessages = request.messages.filter(m => m.role !== 'system');

    // Helper to build the body
    const buildBody = (includeSystemInstruction: boolean) => {
      const contents = otherMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // If we aren't using the formal system_instruction field, prepend it to the first user message
      if (!includeSystemInstruction && systemMessage && contents.length > 0) {
        const firstUserMsg = contents.find(c => c.role === 'user');
        if (firstUserMsg) {
          firstUserMsg.parts[0].text = `Instructions: ${systemMessage.content}\n\nUser Message: ${firstUserMsg.parts[0].text}`;
        }
      }

      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          maxOutputTokens: 2048,
        }
      };

      if (includeSystemInstruction && systemMessage) {
        body.system_instruction = {
          parts: [{ text: systemMessage.content }]
        };
      }

      return body;
    };

    // Try with system_instruction first if version is v1beta
    const useFormalSystemMsg = version === 'v1beta' && !!systemMessage;
    let body = buildBody(useFormalSystemMsg);

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // If first attempt failed with an 'unknown field' error, retry by prepending
    if (!response.ok && useFormalSystemMsg) {
      const errorText = await response.clone().text();
      if (errorText.includes('system_instruction')) {
        console.warn(`[Gemini] system_instruction not supported by ${modelId} on ${version}. Retrying with prepended prompt...`);
        body = buildBody(false);
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Gemini Error ${response.status}`;
      try {
        const errJson = JSON.parse(errorText);
        errorMessage = errJson.error?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      model: modelId,
    };
  };

  let requestedModel = request.model?.replace('google/', '') || 'gemini-1.5-flash';
  if (requestedModel.includes('gemini-2.0-flash')) requestedModel = 'gemini-2.0-flash-exp';

  try {
    return await tryModel(requestedModel, 'v1beta');
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[Gemini] First attempt failed: ${errorMsg}. Trying fallback...`);
    try {
      // Fallback 1: gemini-1.5-flash-latest on v1beta
      return await tryModel('gemini-1.5-flash-latest', 'v1beta');
    } catch {
      try {
        // Fallback 2: gemini-1.5-flash on v1
        return await tryModel('gemini-1.5-flash', 'v1');
      } catch (err3: unknown) {
        const finalErrorMsg = err3 instanceof Error ? err3.message : String(err3);
        return {
          content: '',
          model: requestedModel,
          error: `Gemini Direct Call Failed: ${finalErrorMsg}`,
        };
      }
    }
  }
}

// Test provider connection
export async function testProviderConnection(
  provider: string,
  apiKey: string,
  apiBase?: string
): Promise<{ success: boolean; message: string }> {
  // Direct test for Gemini
  if (provider === 'gemini') {
    return testGeminiDirectly(apiKey, apiBase);
  }

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

async function testGeminiDirectly(apiKey: string, apiBase?: string): Promise<{ success: boolean; message: string }> {
  const baseUrl = apiBase || 'https://generativelanguage.googleapis.com/v1beta';
  const testUrl = `${baseUrl.replace(/\/$/, '')}/models?key=${apiKey}`;

  try {
    const response = await fetch(testUrl);
    if (response.ok) {
      return { success: true, message: 'Connection successful (Frontend Direct)!' };
    } else {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return { success: false, message: `Failed: ${json.error?.message || text}` };
      } catch {
        return { success: false, message: `Failed: ${response.status} - ${text}` };
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Network error: ${msg}` };
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
