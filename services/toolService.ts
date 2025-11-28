

/**
 * Tool Service
 * Handles execution of simulated backend functions.
 * Returns raw JSON data to be fed back into the conversation context.
 */

export const executeTool = async (name: string, args: any): Promise<any> => {
  console.log(`[ToolService] Executing ${name}`, args);
  
  try {
    switch (name) {
      case 'get_weather':
        if (!args.location) throw new Error("Missing 'location' argument");
        return await fetchRealWeather(args.location);

      case 'get_crypto_price':
        if (!args.coin_id) throw new Error("Missing 'coin_id' argument");
        return await fetchRealCrypto(args.coin_id);

      case 'search_knowledge':
        if (!args.query) throw new Error("Missing 'query' argument");
        // Simulated latency for knowledge search
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockSearchKnowledge(args.query);

      case 'get_stock_price':
        if (!args.symbol) throw new Error("Missing 'symbol' argument");
        await new Promise(resolve => setTimeout(resolve, 600));
        return mockGetStockPrice(args.symbol);

      default:
        return { 
          error: true, 
          message: `Tool '${name}' not found. Available tools: get_weather, search_knowledge, get_stock_price, get_crypto_price.` 
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
/*                            REAL DATA FETCHING                              */
/* -------------------------------------------------------------------------- */

// Simple mapping for demo purposes. 
// In prod, you'd use a Geocoding API (but that usually requires a key).
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'mumbai': { lat: 19.0760, lng: 72.8777 }
};

const fetchRealWeather = async (location: string) => {
  const normalizedLoc = location.toLowerCase().trim();
  const coords = CITY_COORDS[normalizedLoc];

  if (!coords) {
    // Fallback to mock if city not in our small manual list
    console.warn(`[ToolService] City '${location}' not in coord list, using mock.`);
    return mockGetWeather(location);
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );
    
    if (!response.ok) throw new Error('Weather API failed');
    
    const data = await response.json();
    const current = data.current;
    
    // Map WMO codes to text
    const weatherCode = current.weather_code;
    let condition = "Clear";
    if (weatherCode > 0 && weatherCode <= 3) condition = "Cloudy";
    if (weatherCode >= 45 && weatherCode <= 48) condition = "Foggy";
    if (weatherCode >= 51 && weatherCode <= 67) condition = "Rainy";
    if (weatherCode >= 71 && weatherCode <= 77) condition = "Snowy";
    if (weatherCode >= 95) condition = "Thunderstorm";

    return {
      location: location, // Return original name case
      temperature: `${current.temperature_2m}${data.current_units.temperature_2m}`,
      condition: condition,
      humidity: `${current.relative_humidity_2m}%`,
      windSpeed: `${current.wind_speed_10m} ${data.current_units.wind_speed_10m}`,
      source: "Open-Meteo API (Real-time)",
      rawCode: weatherCode
    };

  } catch (e) {
    console.error("Weather fetch failed, falling back to mock", e);
    return mockGetWeather(location);
  }
};

const fetchRealCrypto = async (coinId: string) => {
  // CoinGecko API is free for simple price lookups
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) throw new Error('Crypto API failed');
    
    const data = await response.json();
    const coin = data[coinId.toLowerCase()];
    
    if (!coin) {
      return { 
        error: true, 
        message: `Coin '${coinId}' not found. Try 'bitcoin', 'ethereum', or 'solana'.` 
      };
    }

    return {
      symbol: coinId.toUpperCase(),
      price: `$${coin.usd.toLocaleString()}`,
      change24h: `${coin.usd_24h_change > 0 ? '+' : ''}${coin.usd_24h_change.toFixed(2)}%`,
      trend: coin.usd_24h_change >= 0 ? 'UP' : 'DOWN',
      source: "CoinGecko API (Real-time)"
    };

  } catch (e) {
    // Mock Fallback for Crypto
    const basePrice = coinId.toLowerCase() === 'bitcoin' ? 65000 : 3000;
    return {
        symbol: coinId.toUpperCase(),
        price: `$${(basePrice + Math.random() * 100).toFixed(2)}`,
        change24h: "+1.2%",
        trend: "UP",
        source: "Mock Data (API Unavailable)"
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
    forecast: `Expect ${condition.toLowerCase()} conditions throughout the day.`,
    source: "Mock Data"
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
