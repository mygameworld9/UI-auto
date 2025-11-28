
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
Each node MUST be an object with EXACTLY ONE key (the component name).

1. "container"
   - Props:
     - layout: "COL" (default), "ROW", "GRID"
     - gap: "GAP_SM", "GAP_MD", "GAP_LG", "GAP_XL"
     - padding: boolean
     - background: "DEFAULT" (transparent), "SURFACE", "GLASS"
     - bgImage: string (URL for background image)
     - className: string (Tailwind classes for height, aspect ratio, border radius etc.)
     - children: Array of Nodes

2. "hero"
   - Props:
     - title: string
     - subtitle: string
     - gradient: "BLUE_PURPLE", "ORANGE_RED", "GREEN_TEAL"
     - align: "CENTER", "LEFT"
     - children: Array of Nodes (Buttons usually)

3. "text"
   - Props:
     - content: string
     - variant: "H1", "H2", "H3", "BODY", "CAPTION", "CODE"
     - color: "DEFAULT", "MUTED", "PRIMARY", "ACCENT", "DANGER", "SUCCESS"
     - font: "SANS" (default), "SERIF", "CURSIVE"

4. "button"
   - Props:
     - label: string
     - variant: "PRIMARY", "SECONDARY", "GHOST", "DANGER", "GLOW", "OUTLINE", "SOFT", "GRADIENT"
     - icon: string (Lucide icon name)
     - action: { "type": string, "payload": any } 
       * Common types: "NAVIGATE", "PATCH_STATE", "TRIGGER_EFFECT"

5. "card"
   - Props:
     - title: string
     - variant: "DEFAULT", "GLASS", "NEON", "OUTLINED", "ELEVATED", "FROSTED"
     - children: Array of Nodes

6. "table"
   - Props:
     - headers: Array<string>
     - rows: Array<Array<string | UINode>> (Can be simple strings or nested components like Badges)

7. "stat"
   - Props:
     - label: string
     - value: string
     - trend: string
     - trendDirection: "UP", "DOWN", "NEUTRAL"

8. "progress"
   - Props:
     - label: string
     - value: number (0-100)
     - color: "BLUE", "GREEN", "ORANGE", "RED"

9. "alert"
   - Props:
     - title: string
     - description: string
     - variant: "INFO", "SUCCESS", "WARNING", "ERROR"

10. "avatar"
    - Props:
      - initials: string
      - src: string (URL)
      - status: "ONLINE", "OFFLINE", "BUSY"

11. "chart" (Recharts)
    - Props:
      - title: string
      - type: "BAR", "LINE", "AREA"
      - color: string (Hex)
      - data: Array<{ name: string, value: number }>

12. "accordion"
    - Props:
      - variant: "DEFAULT", "SEPARATED"
      - items: Array<{ title: string, content: Array<Nodes> }>

13. "image"
    - Props:
      - src: string (Use placeholder APIs if needed)
      - alt: string
      - caption: string
      - aspectRatio: "VIDEO", "SQUARE", "WIDE"

14. "map"
    - Props:
      - label: string
      - defaultZoom: number
      - style: "DARK", "LIGHT", "SATELLITE"
      - markers: Array<{ title: string, lat: number, lng: number }>
`;

export const FEW_SHOT_EXAMPLES = `
EXAMPLE 1: User asks "Show me a modern landing page hero"
Response:
{
  "hero": {
    "title": "Build the Future",
    "subtitle": "Deploy your AI agents in seconds with our distributed infrastructure.",
    "gradient": "BLUE_PURPLE",
    "align": "CENTER",
    "children": [
      { 
        "container": {
          "layout": "ROW",
          "gap": "GAP_MD",
          "children": [
            { "button": { "label": "Get Started", "variant": "GRADIENT", "icon": "Rocket", "action": { "type": "NAVIGATE", "payload": "/signup" } } },
            { "button": { "label": "Documentation", "variant": "OUTLINE", "icon": "Book", "action": { "type": "NAVIGATE", "payload": "/docs" } } }
          ]
        }
      }
    ]
  }
}

EXAMPLE 2: User asks "System Health Dashboard"
Response:
{
  "container": {
    "layout": "COL",
    "gap": "GAP_LG",
    "padding": true,
    "background": "SURFACE",
    "children": [
      {
        "container": {
          "layout": "ROW",
          "className": "justify-between",
          "children": [
            { "text": { "content": "System Status", "variant": "H1" } },
            { 
              "container": {
                 "layout": "ROW",
                 "gap": "GAP_SM",
                 "children": [
                    { "text": { "content": "Last updated: Just now", "variant": "CAPTION", "color": "MUTED" } },
                    { "avatar": { "initials": "AD", "status": "ONLINE" } }
                 ]
              }
            }
          ]
        }
      },
      {
        "container": {
          "layout": "GRID",
          "gap": "GAP_MD",
          "children": [
            { "stat": { "label": "Server Uptime", "value": "99.99%", "trend": "+0.01%", "trendDirection": "UP" } },
            { "stat": { "label": "Active Sessions", "value": "14,205", "trend": "+12%", "trendDirection": "UP" } },
            { "stat": { "label": "Error Rate", "value": "0.02%", "trend": "-50%", "trendDirection": "DOWN" } }
          ]
        }
      },
      {
        "container": {
          "layout": "GRID",
          "gap": "GAP_MD",
          "className": "grid-cols-1 md:grid-cols-3",
          "children": [
             {
               "card": {
                 "title": "Traffic Volume",
                 "variant": "ELEVATED",
                 "children": [
                   { "chart": { "type": "AREA", "color": "#8b5cf6", "data": [{ "name": "10am", "value": 400 }, { "name": "11am", "value": 600 }, { "name": "12pm", "value": 550 }, { "name": "1pm", "value": 900 }] } }
                 ]
               }
             },
             {
               "card": {
                 "title": "Regional Coverage",
                 "variant": "OUTLINED",
                 "children": [
                   { "map": { "label": "Active Zones", "style": "DARK", "markers": [{ "title": "US-East", "lat": 40, "lng": -74 }, { "title": "EU-West", "lat": 51, "lng": 0 }] } }
                 ]
               }
             },
             {
               "card": {
                 "title": "Recent Alerts",
                 "variant": "FROSTED",
                 "children": [
                   { "alert": { "title": "Backup Complete", "description": "Daily snapshot finished successfully.", "variant": "SUCCESS" } },
                   { "alert": { "title": "High Latency", "description": "us-east-1 detected 200ms lag.", "variant": "WARNING" } }
                 ]
               }
             }
          ]
        }
      }
    ]
  }
}

EXAMPLE 3: User asks "Create a warm vintage Christmas greeting card for family"
Response:
{
  "container": {
    "layout": "COL",
    "padding": true,
    "gap": "GAP_LG",
    "className": "aspect-[3/4] max-w-md mx-auto rounded-3xl shadow-2xl border-4 border-amber-900/40 items-center text-center justify-center relative overflow-hidden",
    "bgImage": "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?q=80&w=1000&auto=format&fit=crop",
    "children": [
      {
        "text": {
          "content": "Merry Christmas",
          "variant": "H1",
          "color": "ACCENT", 
          "font": "CURSIVE"
        }
      },
      {
        "text": {
          "content": "May your days be merry and bright, and may all your Christmases be white.",
          "variant": "BODY",
          "color": "DEFAULT",
          "font": "SERIF"
        }
      },
      { 
        "container": { 
           "layout": "COL", 
           "gap": "GAP_SM",
           "className": "w-full items-center",
           "children": [
              { "separator": {} },
              {
                "text": {
                  "content": "With love, The Smiths",
                  "variant": "H3",
                  "color": "DEFAULT",
                  "font": "CURSIVE"
                }
              }
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
6. **Data Injection:** You ARE the backend. You must generate realistic mock data for Charts, Tables, and Stats. Do not leave them empty.

**INTERACTIVE CAPABILITIES:**
You can make buttons trigger visual effects using the "action" prop with type "TRIGGER_EFFECT".
- Confetti: { "action": { "type": "TRIGGER_EFFECT", "payload": { "effect": "CONFETTI" } } }
- Snow:     { "action": { "type": "TRIGGER_EFFECT", "payload": { "effect": "SNOW" } } }
Use these for celebrations, holiday themes, or high-impact user interactions.

**AVAILABLE TOOLS (FUNCTION CALLING):**
You have access to the following tools. If the user asks a question that requires real-time data or external knowledge, invoke a tool instead of generating a UI.

1. \`get_weather(location: string)\`: Returns current temperature and condition.
2. \`search_knowledge(query: string)\`: Returns summary from knowledge base (use for generic questions).
3. \`get_stock_price(symbol: string)\`: Returns stock data.
4. \`get_crypto_price(coin_id: string)\`: Returns current price and 24h change for a cryptocurrency (e.g., 'bitcoin', 'ethereum', 'solana').

**TOOL CALLING FORMAT:**
If you need to call a tool, output a JSON object with a single key "tool_call". DO NOT output a UI tree in this case.
Example:
{ "tool_call": { "name": "get_weather", "arguments": { "location": "Tokyo" } } }
`;
