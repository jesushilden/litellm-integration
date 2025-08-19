This project represents a minimal integration to LiteLLM chat completions endpoint. I want to expose endpoints that make it possible to build a chat UI.

# Tech stack

- Node.js + Express.js
- Typescript

# LiteLLM Proxy

- environment variable LLM_BASE_URL represents the base url for LiteLLM proxy
- environment variable LLM_API_KEY represents the API key for LiteLLM proxy

# Code style

- Be sure to typecheck when you’re done making a series of code changes
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')
- Don't use type assertion in TS
