/**
 * Chat adapter types for pluggable LLM interface
 */
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface ChatRequest {
    conversationId: string | number;
    messages: ChatMessage[];
    messageType: number;
    content: string;
    stream: boolean;
}
export interface ChatStreamCallbacks {
    onChunk: (text: string) => void;
    onDone: () => void;
    onError: (error: Error) => void;
}
export interface ChatResponse {
    content: string;
    model?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
    };
    latencyMs?: number;
}
export type ChatAdapterType = 'sse-proxy' | 'direct-api' | 'custom';
export interface ChatAdapterConfig {
    type: ChatAdapterType;
    sseApiBaseUrl?: string;
    sseApiToken?: string;
    provider?: 'openai' | 'anthropic';
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    customEndpoint?: string;
    customHeaders?: Record<string, string>;
    customAuthType?: 'bearer' | 'header' | 'none';
    customAuthValue?: string;
}
//# sourceMappingURL=llm.d.ts.map