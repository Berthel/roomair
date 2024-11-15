import axios, { AxiosInstance } from 'axios';
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

  constructor() {
    this.api = axios.create({
      baseURL: AIRTHINGS_CONFIG.baseUrl
    });
    
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const newToken = await this.refreshToken();
          if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return this.api.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string) {
    this.api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  async refreshToken(refreshToken?: string) {
    try {
      const response = await axios.post(AIRTHINGS_CONFIG.authUrl, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: AIRTHINGS_CONFIG.clientId,
        client_secret: AIRTHINGS_CONFIG.clientSecret,
        scope: AIRTHINGS_CONFIG.scope
      });

      if (response.data.access_token) {
        this.setAccessToken(response.data.access_token);
        return response.data;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  async getAccounts() {
    const response = await this.api.get('/v1/accounts');
    return response.data;
  }

  async getDevices(accountId: string) {
    const response = await this.api.get<{ devices: AirthingsDevice[] }>(`/v1/accounts/${accountId}/devices`);
    return response.data;
  }

  async getSensorData(accountId: string, serialNumbers: string[]) {
    const params = new URLSearchParams();
    serialNumbers.forEach(sn => params.append('sn', sn));
    
    const response = await this.api.get<{ results: SensorReading[] }>(
      `/v1/accounts/${accountId}/sensors?${params.toString()}`
    );
    return response.data;
  }
}

export const airthingsApi = new AirthingsAPI();