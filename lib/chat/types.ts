export type Role = "system" | "user" | "assistant" | "tool";

export type ChatMessage = {
  id?: string;
  role: Role;
  content: string;
};

export type ChatRequest = {
  provider: "mock" | "openai" | "anthropic" | "google" | "mistral" | "openrouter";
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  json_mode?: boolean;
  seed?: number;
};

export type StreamChunk = {
  type: "content" | "done" | "error";
  data?: string;
  error?: string;
};
