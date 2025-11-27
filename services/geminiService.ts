
import { GoogleGenAI } from "@google/genai";
import { COMPONENT_SPECS, SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES } from "../constants";
import { UserContext } from "../types";
import { telemetry } from "./telemetry";

// 2.1 & 2.2 Constructing the Prompt with Context
const buildPrompt = (userInput: string, context: UserContext): string => {
  return `
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
};

// Changed return type to AsyncGenerator to yield text chunks
export async function* generateUIStream(prompt: string, context: UserContext): AsyncGenerator<string, void, unknown> {
  // Initialize Gemini inside the function to ensure process.env.API_KEY is fresh
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const fullPrompt = buildPrompt(prompt, context);
  const traceId = telemetry.startTrace('generate_ui_stream');
  let firstTokenReceived = false;
  let accumulatedSize = 0;

  try {
    const responseStream = await genAI.models.generateContentStream({
      model: 'gemini-3-pro-preview', 
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3, 
      }
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      
      if (!firstTokenReceived) {
        const startTime = telemetry.getStartTime(traceId);
        if (startTime) {
           const ttft = performance.now() - startTime;
           telemetry.logMetric(traceId, 'TTFT', ttft);
        }
        firstTokenReceived = true;
      }

      if (text) {
        accumulatedSize += text.length;
        yield text;
      }
    }

  } catch (error) {
    console.error("Generative UI Stream Error:", error);
    telemetry.logEvent(traceId, 'ERROR', { error: String(error) });
    
    // Yield a valid error JSON so the parser can handle it gracefully
    yield JSON.stringify({
      container: {
        layout: 'COL',
        padding: true,
        children: [
          {
            alert: { 
              title: "Generation Error", 
              description: "Failed to stream content. Please check your API Key.", 
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
