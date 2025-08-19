import { ChatCompletionRequest, ChatCompletionResponse } from '../types/chat.js';

function getConfig() {
  const LLM_BASE_URL = process.env.LLM_BASE_URL;
  const LLM_API_KEY = process.env.LLM_API_KEY;

  if (!LLM_BASE_URL || !LLM_API_KEY) {
    throw new Error('Missing required environment variables: LLM_BASE_URL, LLM_API_KEY');
  }

  return { LLM_BASE_URL, LLM_API_KEY };
}

export async function createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  const { LLM_BASE_URL, LLM_API_KEY } = getConfig();
  const response = await fetch(`${LLM_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: request.model || 'gpt-3.5-turbo',
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      stream: request.stream || false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LiteLLM API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<ChatCompletionResponse>;
}

export async function* createChatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<string> {
  const { LLM_BASE_URL, LLM_API_KEY } = getConfig();
  const response = await fetch(`${LLM_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: request.model || 'gpt-3.5-turbo',
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LiteLLM API error: ${response.status} - ${errorText}`);
  }

  if (!response.body) {
    throw new Error('No response body for streaming');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          yield data;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}