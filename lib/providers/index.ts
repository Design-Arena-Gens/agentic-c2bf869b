import { ChatRequest } from "@/lib/chat/types";
import { streamFromMock } from "@/lib/providers/mock";
import { streamFromOpenAI } from "@/lib/providers/openai";

export type ProviderStream = AsyncGenerator<string, void, void>;

export async function getProviderStream(req: ChatRequest): Promise<ProviderStream> {
  const { provider } = req;
  switch (provider) {
    case "mock":
      return streamFromMock(req);
    case "openai":
      return streamFromOpenAI(req);
    // Stubs for future implementations
    case "anthropic":
    case "google":
    case "mistral":
    case "openrouter":
      return streamFromMock({ ...req, provider: "mock", model: "mock-creative" });
    default:
      return streamFromMock({ ...req, provider: "mock", model: "mock-default" });
  }
}
