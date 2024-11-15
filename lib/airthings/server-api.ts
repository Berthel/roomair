import axios, { AxiosInstance, AxiosError } from 'axios';
import { AIRTHINGS_CONFIG } from './config';

export interface AirthingsDevice {
  serialNumber: string;
  name: string;
  home?: string;
}

export interface SensorReading {
  serialNumber: string;
  recorded: string;
  sensors: Array<{
    sensorType: string;
    value: number;
    unit: string;
  }>;
  batteryPercentage?: number;
}

class AirthingsAPI {
  private api: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    if (!AIRTHINGS_CONFIG.baseUrl || !AIRTHINGS_CONFIG.authUrl || 
        !AIRTHINGS_CONFIG.clientId || !AIRTHINGS_CONFIG.clientSecret) {
      throw new Error('Missing required Airthings configuration');
    }

    this.api = axios.create({
      baseURL: AIRTHINGS_CONFIG.baseUrl
    });

    // Add response interceptor for better error handling
    this.api.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method
          }
        });
        return Promise.reject(error);
      }
    );
  }

  private async ensureToken() {
    try {
      if (!this.accessToken) {
        console.log('Requesting new access token...');
        const response = await axios.post(AIRTHINGS_CONFIG.authUrl, {
          grant_type: 'client_credentials',
          client_id: AIRTHINGS_CONFIG.clientId,
          client_secret: AIRTHINGS_CONFIG.clientSecret,
          scope: AIRTHINGS_CONFIG.scope
        });

        if (!response.data.access_token) {
          throw new Error('No access token received from Airthings');
        }

        this.accessToken = response.data.access_token;
        this.api.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
        console.log('Successfully obtained new access token');
      }
    } catch (error) {
      console.error('Token acquisition failed:', error);
      throw new Error('Failed to obtain access token');
    }
  }

  async getAccounts() {
    try {
      await this.ensureToken();
      const response = await this.api.get('/v1/accounts');
      return response.data;
    } catch (error) {
      console.error('getAccounts failed:', error);
      throw error;
    }
  }

  async getDevices(accountId: string) {
    try {
      await this.ensureToken();
      const response = await this.api.get<{ devices: AirthingsDevice[] }>(
        `/v1/accounts/${accountId}/devices`
      );
      return response.data;
    } catch (error) {
      console.error('getDevices failed:', error);
      throw error;
    }
  }

  async getSensorData(accountId: string, serialNumbers: string[]) {
    try {
      await this.ensureToken();
      const params = new URLSearchParams();
      serialNumbers.forEach(sn => params.append('sn', sn));
      
      const response = await this.api.get<{ results: SensorReading[] }>(
        `/v1/accounts/${accountId}/sensors?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('getSensorData failed:', error);
      throw error;
    }
  }
}

export const airthingsApi = new AirthingsAPI();