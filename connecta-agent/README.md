# Connecta Standalone AI Agent Server

This is a standalone service for the Connecta AI Agent. It handles AI intents, tool execution, and processing logic independently from the main server.

## Setup

1.  **Environment Variables**:
    Create a `.env` file based on `.env.example`.
    ```env
    AGENT_PORT=5001
    MAIN_SERVER_URL=https://api.myconnecta.ng  # URL of your main backend
    OPENROUTER_API_KEY=your_key
    GEMINI_API_KEY=your_key
    AI_PROVIDER=gemini
    AI_MODEL=gemini-2.0-flash
    ```

2.  **Installation**:
    ```bash
    npm install
    ```

3.  **Development**:
    ```bash
    npm run dev
    ```

4.  **Production (using Docker)**:
    ```bash
    docker-compose up -d --build
    ```

## Integration with Main Server

On your **Main Server**, add the following to its `.env`:

```env
AGENT_SERVER_URL=http://your-agent-vps-ip:5001
```

The main server's `/api/agent` route will now automatically forward requests to this service.

## Why separate?
- **Performance**: AI processing (especially with larger models or complex logic) can be resource-intensive.
- **Scalability**: You can host the agent on a separate VPS or even a specialized AI instance.
- **Reliability**: If the AI agent server goes down, the main server (payments, jobs, etc.) stays up.
