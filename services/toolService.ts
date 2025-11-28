
/**
 * Tool Service
 * Handles execution of simulated backend functions.
 * Returns raw JSON data to be fed back into the conversation context.
 */

export const executeTool = async (name: string, args: any): Promise<any> => {
  console.log(`[ToolService] Executing ${name}`, args);
  
  // Simulate network latency (500ms - 1500ms)
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  try {
    switch (name) {
      case 'get_weather':
        if (!args.location) throw new Error("Missing 'location' argument");
        return mockGetWeather(args.location);

      case 'search_knowledge':
        if (!args.query) throw new Error("Missing 'query' argument");
        return mockSearchKnowledge(args.query);

      case 'get_stock_price':
        if (!args.symbol) throw new Error("Missing 'symbol' argument");
        return mockGetStockPrice(args.symbol);

      default:
        return { 
          error: true, 
          message: `Tool '${name}' not found. Available tools: get_weather, search_knowledge, get_stock_price.` 
        };
    }
  } catch (error: any) {
    console.error(`[ToolService] Error executing ${name}:`, error);
    return {
      error: true,
      message: `Failed to execute tool '${name}': ${error.message}`
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                                MOCK LOGIC                                  */
/* -------------------------------------------------------------------------- */

const mockGetWeather = (location: string) => {
  const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Thunderstorm', 'Snowy'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  // Temperature based on condition (rough logic)
  let baseTemp = 20;
  if (condition === 'Snowy') baseTemp = -5;
  if (condition === 'Rainy') baseTemp = 15;
  if (condition === 'Sunny') baseTemp = 28;
  
  const temp = Math.floor(baseTemp + (Math.random() * 10 - 5));

  return {
    location: location,
    temperature: `${temp}°C`,
    condition: condition,
    humidity: `${Math.floor(Math.random() * 60) + 30}%`,
    windSpeed: `${Math.floor(Math.random() * 30) + 5} km/h`,
    forecast: `Expect ${condition.toLowerCase()} conditions throughout the day.`
  };
};

const mockGetStockPrice = (symbol: string) => {
  const ticker = symbol.toUpperCase();
  const basePrice = Math.random() * 200 + 50; // Random price between 50 and 250
  
  // Generate realistic intraday chart data (compatible with Recharts schema)
  // Schema: { name: string, value: number }[]
  const data = [];
  const hours = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'];
  
  let currentPrice = basePrice;
  for (const time of hours) {
    const volatility = (Math.random() - 0.48) * 5; // Slight upward bias
    currentPrice += volatility;
    data.push({
      name: time,
      value: Number(currentPrice.toFixed(2))
    });
  }

  const open = data[0].value;
  const close = data[data.length - 1].value;
  const change = close - open;
  const changePercent = (change / open) * 100;

  return {
    symbol: ticker,
    currentPrice: close,
    currency: "USD",
    change: change.toFixed(2),
    changePercent: `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
    trend: change >= 0 ? 'UP' : 'DOWN',
    volume: Math.floor(Math.random() * 1000000) + 500000,
    history: data
  };
};

const mockSearchKnowledge = (query: string) => {
  return {
    query: query,
    results: [
      {
        source: "Internal Knowledge Base",
        title: "System Architecture v2.4",
        excerpt: `Search result for "${query}": The distributed node system handles 50k req/s with auto-scaling groups in us-east-1 and eu-west-1.`
      },
      {
        source: "API Documentation",
        title: "Rate Limiting & Quotas",
        excerpt: "Standard tier allows 1000 requests per minute. Enterprise tier offers dedicated throughput."
      }
    ],
    generatedSummary: `Based on internal docs, "${query}" relates to our high-availability cluster config deployed last Q3. It supports multi-region failover.`
  };
};
