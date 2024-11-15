import axios, { AxiosInstance, AxiosError } from 'axios';

const AIRTHINGS_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_AIRTHINGS_BASE_URL,
  authUrl: process.env.NEXT_PUBLIC_AIRTHINGS_AUTH_URL,
  clientId: process.env.NEXT_PUBLIC_AIRTHINGS_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_AIRTHINGS_CLIENT_SECRET,
  scope: process.env.NEXT_PUBLIC_AIRTHINGS_SCOPE
};

interface SensorReading {
  sensorType: string;
  value: number;
  unit: string;
}

interface SensorDevice {
  serialNumber: string;
  sensors: SensorReading[];
  recorded: string;
  batteryPercentage: number;
}

interface SensorResponse {
  results: SensorDevice[];
  hasNext: boolean;
  totalPages: number;
}

export class AirthingsAPI {
  private api: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    console.log('Initializing AirthingsAPI with config:', {
      baseUrl: AIRTHINGS_CONFIG.baseUrl,
      authUrl: AIRTHINGS_CONFIG.authUrl,
      hasClientId: !!AIRTHINGS_CONFIG.clientId,
      hasClientSecret: !!AIRTHINGS_CONFIG.clientSecret,
      scope: AIRTHINGS_CONFIG.scope
    });

    // Validate configuration
    if (!AIRTHINGS_CONFIG.baseUrl) throw new Error('Missing AIRTHINGS_BASE_URL');
    if (!AIRTHINGS_CONFIG.authUrl) throw new Error('Missing AIRTHINGS_AUTH_URL');
    if (!AIRTHINGS_CONFIG.clientId) throw new Error('Missing AIRTHINGS_CLIENT_ID');
    if (!AIRTHINGS_CONFIG.clientSecret) throw new Error('Missing AIRTHINGS_CLIENT_SECRET');
    if (!AIRTHINGS_CONFIG.scope) throw new Error('Missing AIRTHINGS_SCOPE');

    this.api = axios.create({
      baseURL: AIRTHINGS_CONFIG.baseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        const sanitizedConfig = {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: {
            ...config.headers,
            Authorization: config.headers.Authorization ? '[REDACTED]' : undefined
          }
        };
        console.log('Outgoing request:', sanitizedConfig);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        console.log('Response received:', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error: AxiosError) => {
        console.error('Response error:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  private async ensureToken() {
    console.log('=== Starting token acquisition ===');
    try {
      if (!this.accessToken) {
        console.log('No existing token found, getting new token...');

        // Create Basic Auth token
        const basicAuth = Buffer.from(
          `${AIRTHINGS_CONFIG.clientId}:${AIRTHINGS_CONFIG.clientSecret}`
        ).toString('base64');

        console.log('Making token request...');
        const tokenResponse = await axios({
          method: 'post',
          url: AIRTHINGS_CONFIG.authUrl,
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          data: new URLSearchParams({
            grant_type: 'client_credentials',
            scope: AIRTHINGS_CONFIG.scope!
          }).toString()
        });

        console.log('Token response received:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          hasAccessToken: !!tokenResponse.data.access_token,
          tokenType: tokenResponse.data.token_type,
          expiresIn: tokenResponse.data.expires_in
        });

        if (!tokenResponse.data.access_token) {
          console.error('Token response missing access_token:', tokenResponse.data);
          throw new Error('No access token received in response');
        }

        this.accessToken = tokenResponse.data.access_token;
        
        // Set up API headers
        this.api.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
        
        console.log('Access token and headers successfully set');
      }
    } catch (error: any) {
      console.error('=== Token acquisition failed ===');
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack
      });
      
      if (error.response) {
        console.error('API Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          config: {
            url: error.response.config?.url,
            method: error.response.config?.method,
            headers: error.response.config?.headers,
            data: error.response.config?.data
          }
        });
      }
      
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async getAccounts() {
    await this.ensureToken();
    try {
      console.log('Fetching accounts...');
      const response = await this.api.get('/v1/accounts');
      console.log('Accounts response raw data:', JSON.stringify(response.data, null, 2));
      const accounts = Array.isArray(response.data) ? response.data : response.data.accounts || [response.data];
      console.log('Processed accounts:', JSON.stringify(accounts, null, 2));
      return accounts;
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      throw error;
    }
  }

  async getDevices(accountId: string) {
    await this.ensureToken();
    try {
      console.log(`Fetching devices for account ${accountId}...`);
      const response = await this.api.get(`/v1/accounts/${accountId}/devices`);
      console.log('Devices response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      throw error;
    }
  }

  async getSensors(accountId: string, serialNumbers?: string[], page: number = 1) {
    await this.ensureToken();
    try {
      console.log(`Fetching sensors for account ${accountId} (page ${page})...`);
      console.log('Parameters:', { accountId, serialNumbers, page });
      
      const response = await this.api.get<SensorResponse>(`/v1/accounts/${accountId}/sensors`, {
        params: {
          ...(serialNumbers ? { serialNumbers: serialNumbers.join(',') } : {}),
          page
        }
      });
      
      console.log('Sensors response:', {
        status: response.status,
        hasData: !!response.data,
        resultsCount: response.data.results.length,
        hasNext: response.data.hasNext,
        totalPages: response.data.totalPages,
        rawData: JSON.stringify(response.data, null, 2)
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch sensors:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        accountId,
        serialNumbers,
        page
      });
      throw error;
    }
  }
}

export const airthingsApi = new AirthingsAPI();