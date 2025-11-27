import { UserContext } from "./types";

export const INITIAL_CONTEXT: UserContext = {
  role: 'user',
  device: 'desktop',
  theme: 'dark',
};

// 2.1 Prompt Engineering - Detailed Component Specs for the LLM
export const COMPONENT_SPECS = `
COMPONENT DEFINITIONS (Protobuf OneOf Schema)
---------------------------------------------
Each node in the tree must be an object with EXACTLY ONE of the following keys. 
The value of that key is the properties object.

1. "container"
   - Props:
     - layout: "COL" (default), "ROW", "GRID"
     - gap: "GAP_SM", "GAP_MD", "GAP_LG"
     - padding: boolean
     - className: string
     - children: Array of Nodes
   - Example: { "container": { "layout": "ROW", "children": [ ... ] } }

2. "text"
   - Props:
     - content: string
     - variant: "H1", "H2", "H3", "BODY", "CAPTION"
     - color: "DEFAULT", "MUTED", "PRIMARY", "DANGER"
   - Example: { "text": { "content": "Dashboard", "variant": "H1" } }

3. "button"
   - Props:
     - label: string
     - variant: "PRIMARY", "SECONDARY", "GHOST", "DANGER"
     - icon: string (Lucide icon name)
     - action: { "type": "NAVIGATE" | "SUBMIT", "payload": "..." }
   - Example: { "button": { "label": "Save", "variant": "PRIMARY" } }

4. "card"
   - Props:
     - title: string
     - variant: "DEFAULT", "GLASS"
     - children: Array of Nodes
   - Example: { "card": { "title": "Profile", "children": [ ... ] } }

5. "input"
   - Props:
     - label: string
     - placeholder: string
     - inputType: "text", "email", "password"

6. "stat"
   - Props:
     - label: string
     - value: string
     - trend: string
     - trendDirection: "UP", "DOWN"

7. "chart"
   - Props:
     - title: string
     - type: "BAR", "LINE", "AREA"
     - color: string (Hex)
     - data: Array<{ name: string, value: number }>

8. "separator"
   - Props: {} (Empty object)
`;

export const FEW_SHOT_EXAMPLES = `
EXAMPLE 1: User asks for "A simple login form"
Response:
{
  "container": {
    "layout": "COL",
    "padding": true,
    "className": "items-center justify-center h-full",
    "children": [
      {
        "card": {
          "title": "Welcome Back",
          "variant": "GLASS",
          "children": [
            { "input": { "label": "Email", "placeholder": "user@example.com", "inputType": "email" } },
            { "input": { "label": "Password", "placeholder": "****", "inputType": "password" } },
            {
              "container": {
                "layout": "ROW",
                "gap": "GAP_SM",
                "className": "justify-end mt-4",
                "children": [
                  { "button": { "label": "Sign In", "variant": "PRIMARY", "action": { "type": "SUBMIT_LOGIN", "payload": "login" } } }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}

EXAMPLE 2: User asks for "KPI Dashboard"
Response:
{
  "container": {
    "layout": "COL",
    "gap": "GAP_LG",
    "padding": true,
    "children": [
      { "text": { "content": "Executive Overview", "variant": "H1" } },
      {
        "container": {
          "layout": "GRID",
          "gap": "GAP_MD",
          "children": [
            { "stat": { "label": "Revenue", "value": "$124k", "trend": "+14%", "trendDirection": "UP" } },
            { "stat": { "label": "Users", "value": "1.2k", "trend": "+5%", "trendDirection": "UP" } },
            { "stat": { "label": "Churn", "value": "2.1%", "trend": "-0.5%", "trendDirection": "DOWN" } }
          ]
        }
      }
    ]
  }
}
`;

export const SYSTEM_INSTRUCTION = `
You are the **UI Generative Engine** for a Google-scale application.
Your output must be strictly machine-readable JSON that maps 1:1 to a Protobuf schema.

**CRITICAL RULES:**
1. **No Markdown:** Do not output \`\`\`json blocks. Output RAW JSON only.
2. **Oneof Handling:** This is the most important rule. Since our schema uses \`oneof\` for components, you must NEVER flatten properties.
   - WRONG: { "type": "Button", "label": "Submit" }
   - WRONG: { "componentType": "text", "content": "Hello" }
   - RIGHT: { "button": { "label": "Submit" } }
   - RIGHT: { "text": { "content": "Hello" } }
   (The key name matches the \`oneof\` field name in the proto definition).

3. **Enums are Strings:** Use the string name of the enum value (e.g., "GAP_MEDIUM", "PRIMARY", "ROW").
4. **Recursive Structure:** Always wrap children in a \`children\` array inside a \`container\` or \`card\`.
5. **No IDs:** Do not generate IDs. The client handles indexing.
`;