"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import GaugeChart from '@/components/GaugeChart';
import { useAirthingsData } from '@/hooks/useAirthingsData';
import { outdoorData } from '@/lib/mock-data';

export default function AirQualityDashboard() {
  const { isLoading, error, sensorData, devices } = useAirthingsData();
  const [selectedRoom, setSelectedRoom] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load air quality data'}
        </AlertDescription>
      </Alert>
    );
  }

  const currentDevice = devices.find(device => device.serialNumber === selectedRoom);
  const currentSensorData = sensorData.find(data => data.serialNumber === selectedRoom);

  if (!selectedRoom && devices.length > 0) {
    setSelectedRoom(devices[0].serialNumber);
  }

  const getSensorValue = (type: string) => {
    return currentSensorData?.sensors.find(s => s.sensorType.toLowerCase() === type)?.value ?? 0;
  };

  const currentData = {
    co2: getSensorValue('co2'),
    pm25: { indoor: getSensorValue('pm25') },
    humidity: getSensorValue('humidity'),
    temp: getSensorValue('temp')
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Select value={selectedRoom} onValueChange={setSelectedRoom}>
        <SelectTrigger className="w-full font-bold">
          <SelectValue placeholder="Vælg rum" />
        </SelectTrigger>
        <SelectContent>
          {devices.map(device => (
            <SelectItem key={device.serialNumber} value={device.serialNumber} className="font-bold">
              {device.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Indendørs luftkvalitet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <GaugeChart
              value={currentData.co2}
              maxValue={1500}
              title="CO₂"
              unit="ppm"
              type="co2"
            />
            <GaugeChart
              value={currentData.pm25.indoor}
              maxValue={25}
              title="PM2.5"
              unit="µg/m³"
              type="pm25"
            />
            <GaugeChart
              value={currentData.humidity}
              maxValue={100}
              title="Luftfugtighed"
              unit="%"
              type="humidity"
            />
            <GaugeChart
              value={currentData.temp}
              maxValue={30}
              title="Temperatur"
              unit="°C"
              type="temp"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Udendørs forhold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <GaugeChart
              value={outdoorData.temp}
              maxValue={30}
              title="Temperatur"
              unit="°C"
              type="temp"
              isOutdoor
            />
            <GaugeChart
              value={outdoorData.pm25}
              maxValue={25}
              title="PM2.5"
              unit="µg/m³"
              type="pm25"
              isOutdoor
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}