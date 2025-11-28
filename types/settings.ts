export interface ModelConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const DEFAULT_CONFIG: ModelConfig = {
  baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: "",
  model: "gemini-2.0-flash"
};
