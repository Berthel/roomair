"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as airthingsApi from '@/lib/airthings/client-api';

// Map serial numbers to room names
const SENSOR_NAMES: Record<string, string> = {
  '2960010620': 'Stue',
  '2960082469': 'Kontor',
  '2960082972': 'Soveværelse'
};

export function useAirthingsData() {
  const queryClient = useQueryClient();

  const sensorDataQuery = useQuery({
    queryKey: ['airthings', 'sensors'],
    queryFn: () => airthingsApi.getSensorData(),
    refetchInterval: 1000 * 60 * 1 // Poll every minute
  });

  // Create device info from sensor data
  const devices = sensorDataQuery.data?.results.map(sensor => ({
    serialNumber: sensor.serialNumber,
    name: SENSOR_NAMES[sensor.serialNumber] || `Sensor ${sensor.serialNumber}`,
    type: 'VIEW_PLUS',
    location: { name: SENSOR_NAMES[sensor.serialNumber] || `Room ${sensor.serialNumber}` },
    lastUpdated: new Date(sensor.recorded).toLocaleString('da-DK', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  })) ?? [];

  return {
    isLoading: sensorDataQuery.isLoading,
    error: sensorDataQuery.error,
    devices,
    sensorData: sensorDataQuery.data?.results ?? [],
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['airthings'] });
    }
  };
}