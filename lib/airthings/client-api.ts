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

export async function getSensorData(accountId: string, serialNumbers: string[]) {
  const params = new URLSearchParams();
  params.append('accountId', accountId);
  serialNumbers.forEach(sn => params.append('sn', sn));
  
  const response = await api.get<{ results: SensorReading[] }>(
    `/airthings/sensors?${params.toString()}`
  );
  return response.data;
}