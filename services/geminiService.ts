
import { GoogleGenAI } from "@google/genai";
import { COMPONENT_SPECS, SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES } from "../constants";
import { UserContext } from "../types";
import { ModelConfig } from "../types/settings";
import { telemetry } from "./telemetry";

// API Key must be obtained exclusively from process.env.API_KEY as per directives.
const apiKey = process.env.API_KEY;

export async function* generateUIStream(prompt: string, context: UserContext, config: ModelConfig): AsyncGenerator<string, void, unknown> {
  if (!apiKey) {
      yield JSON.stringify({
        container: {
          layout: 'COL',
          padding: true,
          children: [
            { alert: { title: "Configuration Missing", description: "API Key must be configured in environment variables.", variant: 'ERROR' } }
          ]
        }
      });
      return;
  }

  // Always use new GoogleGenAI({ apiKey: process.env.API_KEY })
  const ai = new GoogleGenAI({ apiKey });

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
    ${prompt}

    INSTRUCTIONS:
    Generate the JSON UI Tree. Ensure layout adapts to ${context.device}.
    Do NOT output Markdown. Output raw JSON.
  `;

  const traceId = telemetry.startTrace('generate_ui_stream_gemini');
  let firstTokenReceived = false;
  let accumulatedSize = 0;

  try {
    const modelName = config.model || 'gemini-2.5-flash';
    
    // Using generateContentStream with @google/genai SDK
    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    });

    for await (const chunk of responseStream) {
      const content = chunk.text;
      
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
    console.error("Gemini Stream Error:", error);
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
  if (!apiKey) throw new Error("API Key missing from environment");

  const ai = new GoogleGenAI({ apiKey });
  
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
    const response = await ai.models.generateContent({
      model: config.model || 'gemini-2.5-flash',
      contents: refinementPrompt,
      config: {
        systemInstruction: "You are a JSON-only UI generator.",
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from refine model");
    return JSON.parse(text);
  } catch (error) {
    console.error("Refinement Error:", error);
    throw error;
  }
}

export async function fixComponent(error: string, badNode: any, config: ModelConfig): Promise<any> {
  if (!apiKey) throw new Error("API Key missing from environment");
  const ai = new GoogleGenAI({ apiKey });

  const fixPrompt = `
    You are an expert React/JSON Debugger.
    
    ERROR DETECTED:
    ${error}

    MALFORMED NODE JSON:
    ${JSON.stringify(badNode, null, 2)}

    COMPONENT SPECS:
    ${COMPONENT_SPECS}

    INSTRUCTIONS:
    1. Analyze the error and the JSON.
    2. Fix the JSON so it strictly adheres to the schema and solves the crash.
    3. Return ONLY the fixed JSON node.
    4. Do NOT wrap in Markdown.
  `;

  try {
     const response = await ai.models.generateContent({
      model: config.model || 'gemini-2.5-flash',
      contents: fixPrompt,
      config: {
        systemInstruction: "You are a code fixer. Output raw JSON only.",
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from fix model");
    return JSON.parse(text);
  } catch (err) {
    console.error("Auto-Fix Failed:", err);
    throw err;
  }
}
