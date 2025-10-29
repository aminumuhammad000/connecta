export interface Tool {
  name: string;
  description: string;
  execute: (params: Record<string, any>) => Promise<any>;
}

export interface AgentResponse {
  intent: string;
  tool: string;
  parameters: Record<string, any>;
}