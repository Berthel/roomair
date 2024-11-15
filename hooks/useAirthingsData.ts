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

  const outdoorDataQuery = useQuery({
    queryKey: ['iqair'],
    queryFn: () => iqairApi.getOutdoorData(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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

  // Map outdoor data to our format
  console.log('Outdoor data response:', outdoorDataQuery.data);
  const outdoorSensorData = outdoorDataQuery.data ? {
    pm25: outdoorDataQuery.data?.current?.pm25?.conc ?? 0,
    temperature: outdoorDataQuery.data?.current?.tp ?? 0,
    humidity: outdoorDataQuery.data?.current?.hm ?? 0,
    pressure: outdoorDataQuery.data?.current?.pr ?? 0,
    pm1: outdoorDataQuery.data?.current?.pm1?.conc ?? 0,
    pm10: outdoorDataQuery.data?.current?.pm10?.conc ?? 0,
    aqius: outdoorDataQuery.data?.current?.aqius ?? 0,
    aqicn: outdoorDataQuery.data?.current?.aqicn ?? 0
  } : {};

  return {
    isLoading: sensorDataQuery.isLoading || outdoorDataQuery.isLoading,
    error: sensorDataQuery.error || outdoorDataQuery.error,
    devices,
    sensorData: sensorDataQuery.data?.results ?? [],
    outdoorData: outdoorSensorData,
    outdoorLastUpdated: outdoorDataQuery.data?.current?.ts 
      ? new Date(outdoorDataQuery.data.current.ts).toLocaleString('da-DK', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) 
      : null,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['airthings'] });
      queryClient.invalidateQueries({ queryKey: ['iqair'] });
    }
  };
}