import OpenAI from "openai";
import { COMPONENT_SPECS, SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES } from "../constants";
import { UserContext } from "../types";
import { ModelConfig } from "../types/settings";
import { telemetry } from "./telemetry";

const createClient = (config: ModelConfig) => {
  return new OpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true 
  });
};

const buildMessages = (userInput: string, context: UserContext): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  const contextPrompt = `
    CURRENT USER CONTEXT:
    Role: ${context.role}
    Device: ${context.device}
    Theme: ${context.theme}

    AVAILABLE COMPONENT LIBRARY (PROTOBUF DEFINITIONS):
    ${COMPONENT_SPECS}

    FEW-SHOT EXAMPLES:
    ${FEW_SHOT_EXAMPLES}

    USER REQUEST:
    ${userInput}

    INSTRUCTIONS:
    Generate the JSON UI Tree. Ensure layout adapts to ${context.device}.
    Do NOT output Markdown. Output raw JSON.
  `;

  return [
    { role: "system", content: SYSTEM_INSTRUCTION },
    { role: "user", content: contextPrompt }
  ];
};

export async function* generateUIStream(prompt: string, context: UserContext, config: ModelConfig): AsyncGenerator<string, void, unknown> {
  if (!config.apiKey) {
      yield JSON.stringify({
        container: {
          layout: 'COL',
          padding: true,
          children: [
            { alert: { title: "Configuration Missing", description: "Please set your API Key in settings.", variant: 'ERROR' } }
          ]
        }
      });
      return;
  }

  const client = createClient(config);
  const messages = buildMessages(prompt, context);
  const traceId = telemetry.startTrace('generate_ui_stream_openai');
  let firstTokenReceived = false;
  let accumulatedSize = 0;

  try {
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: messages,
      stream: true,
      temperature: 0.3,
      response_format: { type: "json_object" } // Prefer JSON mode if supported by the model/provider
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      
      if (!firstTokenReceived && content) {
        const startTime = telemetry.getStartTime(traceId);
        if (startTime) {
           const ttft = performance.now() - startTime;
           telemetry.logMetric(traceId, 'TTFT', ttft);
        }
        firstTokenReceived = true;
      }

      if (content) {
        accumulatedSize += content.length;
        yield content;
      }
    }

  } catch (error: any) {
    console.error("OpenAI Stream Error:", error);
    telemetry.logEvent(traceId, 'ERROR', { error: String(error) });
    
    yield JSON.stringify({
      container: {
        layout: 'COL',
        padding: true,
        children: [
          {
            alert: { 
              title: "Generation Error", 
              description: `Failed to stream content: ${error.message || "Unknown error"}`, 
              variant: 'ERROR' 
            }
          }
        ]
      }
    });
  } finally {
    telemetry.logMetric(traceId, 'SIZE', accumulatedSize);
    telemetry.endTrace(traceId);
  }
}

export async function refineComponent(prompt: string, currentJson: any, config: ModelConfig): Promise<any> {
  if (!config.apiKey) throw new Error("API Key missing");

  const client = createClient(config);
  
  const refinementPrompt = `
    You are an expert UI Refiner.
    
    EXISTING COMPONENT JSON:
    ${JSON.stringify(currentJson, null, 2)}

    USER REQUEST FOR MODIFICATION:
    ${prompt}

    COMPONENT SPECS:
    ${COMPONENT_SPECS}

    INSTRUCTIONS:
    1. Modify the EXISTING COMPONENT JSON to satisfy the USER REQUEST.
    2. Maintain the structure and integrity of the JSON.
    3. Return ONLY the updated JSON for the specific component (and its children).
    4. Do NOT wrap in Markdown.
  `;

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: "You are a JSON-only UI generator." },
        { role: "user", content: refinementPrompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("Empty response from refine model");
    return JSON.parse(text);
  } catch (error) {
    console.error("Refinement Error:", error);
    throw error;
  }
}
