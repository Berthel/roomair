"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as airthingsApi from '@/lib/airthings/client-api';

export function useAirthingsData() {
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ['airthings', 'accounts'],
    queryFn: () => airthingsApi.getAccounts(),
    staleTime: 1000 * 60 * 60 // 1 hour
  });

  const accountId = accountsQuery.data?.accounts[0]?.id;

  const devicesQuery = useQuery({
    queryKey: ['airthings', 'devices', accountId],
    queryFn: () => airthingsApi.getDevices(accountId!),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const serialNumbers = devicesQuery.data?.devices.map(d => d.serialNumber) ?? [];

  const sensorDataQuery = useQuery({
    queryKey: ['airthings', 'sensors', accountId, serialNumbers],
    queryFn: () => airthingsApi.getSensorData(accountId!, serialNumbers),
    enabled: !!accountId && serialNumbers.length > 0,
    refetchInterval: 1000 * 60 * 5 // Poll every 5 minutes
  });

  return {
    isLoading: accountsQuery.isLoading || devicesQuery.isLoading || sensorDataQuery.isLoading,
    error: accountsQuery.error || devicesQuery.error || sensorDataQuery.error,
    devices: devicesQuery.data?.devices ?? [],
    sensorData: sensorDataQuery.data?.results ?? [],
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['airthings'] });
    }
  };
}