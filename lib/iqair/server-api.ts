import axios from 'axios';

export interface IQAirMeasurement {
  conc: number;
  aqius: number;
  aqicn: number;
}

export interface IQAirCurrentData {
  pm25: IQAirMeasurement;
  pm10: IQAirMeasurement;
  pm1: IQAirMeasurement;
  pr: number;  // Pressure
  hm: number;  // Humidity
  tp: number;  // Temperature
  ts: string;  // Timestamp
  mainus: string;
  maincn: string;
  aqius: number;
  aqicn: number;
}

export interface IQAirResponse {
  name: string;
  current: IQAirCurrentData;
}

// Realistic mock data based on typical values
const MOCK_DATA: IQAirCurrentData = {
  pm25: { conc: 14, aqius: 53, aqicn: 50 },
  pm10: { conc: 20, aqius: 18, aqicn: 20 },
  pm1: { conc: 8, aqius: 0, aqicn: 0 },
  pr: 1013.25, // Standard atmospheric pressure at sea level
  hm: 65,      // Typical humidity
  tp: 18.5,    // Typical outdoor temperature
  ts: new Date().toISOString(),
  mainus: 'pm25',
  maincn: 'pm25',
  aqius: 53,
  aqicn: 50
};

// Simple in-memory cache
let cache: {
  data: IQAirCurrentData | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

const api = axios.create({
  baseURL: process.env.IQAIR_BASE_URL
});

export async function getOutdoorData(): Promise<IQAirCurrentData> {
  try {
    // In development, always return mock data with slight variations
    if (USE_MOCK_DATA) {
      const variation = () => (Math.random() - 0.5) * 2; // Random value between -1 and 1
      return {
        ...MOCK_DATA,
        pm25: { 
          conc: MOCK_DATA.pm25.conc + variation(),
          aqius: MOCK_DATA.pm25.aqius,
          aqicn: MOCK_DATA.pm25.aqicn
        },
        tp: MOCK_DATA.tp + variation(),
        hm: Math.max(0, Math.min(100, MOCK_DATA.hm + variation())), // Keep between 0-100
        ts: new Date().toISOString()
      };
    }

    // Check if we have valid cached data
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached IQAir data');
      return cache.data;
    }

    if (!process.env.IQAIR_DEVICE_ID) {
      throw new Error('IQAIR_DEVICE_ID is not configured');
    }

    console.log('Fetching fresh IQAir data');
    const response = await api.get<IQAirResponse>(`/${process.env.IQAIR_DEVICE_ID}`);
    
    // Update cache
    cache = {
      data: response.data.current,
      timestamp: now
    };
    
    return response.data.current;
  } catch (error: any) {
    console.error('Failed to fetch IQAir data:', error.response?.status, error.message);
    
    // If we have cached data, return it even if it's expired
    if (cache.data) {
      console.log('Returning expired cached data due to API error');
      return cache.data;
    }
    
    // If no cached data available, return mock data in development
    if (USE_MOCK_DATA) {
      console.log('Returning mock data due to API error');
      return MOCK_DATA;
    }
    
    // In production, return zeros
    return {
      pm25: { conc: 0, aqius: 0, aqicn: 0 },
      pm10: { conc: 0, aqius: 0, aqicn: 0 },
      pm1: { conc: 0, aqius: 0, aqicn: 0 },
      pr: 0,
      hm: 0,
      tp: 0,
      ts: new Date().toISOString(),
      mainus: 'pm25',
      maincn: 'pm25',
      aqius: 0,
      aqicn: 0
    };
  }
}
