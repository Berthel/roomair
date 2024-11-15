import axios from 'axios';
import type { IQAirCurrentData } from './server-api';

const api = axios.create({
  baseURL: '/api'
});

export async function getOutdoorData() {
  try {
    const response = await api.get<{ success: boolean; data: IQAirCurrentData }>(
      '/iqair/outdoor'
    );
    console.log('Client API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching outdoor data:', error);
    throw error;
  }
}
