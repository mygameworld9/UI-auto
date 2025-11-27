import { GoogleGenAI } from "@google/genai";
import { COMPONENT_SPECS, SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES } from "../constants";
import { UserContext, UINode } from "../types";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
  `;
};

export const generateUI = async (prompt: string, context: UserContext): Promise<UINode> => {
  try {
    const fullPrompt = buildPrompt(prompt, context);

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text) as UINode;
    return data;

  } catch (error) {
    console.error("Generative UI Error:", error);
    // Fallback UI matching new OneOf Schema
    return {
      container: {
        layout: 'COL',
        padding: true,
        children: [
          {
            text: { 
              content: "Failed to generate UI. Please try again.", 
              variant: 'BODY', 
              color: 'DANGER' 
            }
          }
        ]
      }
    };
  }
};