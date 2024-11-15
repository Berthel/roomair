import axios from 'axios';
import type { AirthingsDevice, SensorReading } from './server-api';

const api = axios.create({
  baseURL: '/api'
});

export async function getAccounts() {
  const response = await api.get('/airthings/accounts');
  return response.data;
}

export async function getDevices(accountId: string) {
  const response = await api.get<{ devices: AirthingsDevice[] }>(
    `/airthings/devices?accountId=${accountId}`
  );
  return response.data;
}

export async function getSensorData() {
  // Use our new test endpoint that's working
  const response = await api.get<{ data: { results: SensorReading[] } }>(
    `/airthings/test-sensors`
  );
  return response.data.data;
}