"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as airthingsApi from '@/lib/airthings/client-api';
import * as iqairApi from '@/lib/iqair/client-api';

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

  // Temporarily disabled IQAir integration
  /*const outdoorDataQuery = useQuery({
    queryKey: ['iqair'],
    queryFn: () => iqairApi.getOutdoorData(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });*/

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

  // Map outdoor data to our format
  const outdoorSensorData = {};

  return {
    isLoading: sensorDataQuery.isLoading,
    error: sensorDataQuery.error,
    devices,
    sensorData: sensorDataQuery.data?.results ?? [],
    outdoorData: outdoorSensorData,
    outdoorLastUpdated: null,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['airthings'] });
    }
  };
}