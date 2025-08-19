import express from 'express';
import { createChatCompletion, createChatCompletionStream } from '../services/litellm.js';
import { ChatCompletionRequest } from '../types/chat.js';

export const chatRouter = express.Router();

chatRouter.post('/completions', async (req, res) => {
  try {
    const request: ChatCompletionRequest = req.body;

    if (!request.messages || !Array.isArray(request.messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (request.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        for await (const chunk of createChatCompletionStream(request)) {
          res.write(`data: ${chunk}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error) {
        console.error('Streaming error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } else {
      const response = await createChatCompletion(request);
      res.json(response);
    }
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

chatRouter.get('/models', async (req, res) => {
  try {
    const response = await fetch(`${process.env.LLM_BASE_URL}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const models = await response.json();
    res.json(models);
  } catch (error) {
    console.error('Models fetch error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch models'
    });
  }
});