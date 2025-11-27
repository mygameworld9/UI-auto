import { GoogleGenAI } from "@google/genai";
import { COMPONENT_SPECS, SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES } from "../constants";
import { UserContext } from "../types";

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
      if (text) {
        yield text;
      }
    }

  } catch (error) {
    console.error("Generative UI Stream Error:", error);
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
  }
}