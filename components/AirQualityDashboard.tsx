"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import GaugeChart from '@/components/GaugeChart';
import { useAirthingsData } from '@/hooks/useAirthingsData';

export default function AirQualityDashboard() {
  const { isLoading, error, sensorData, devices, outdoorData, outdoorLastUpdated } = useAirthingsData();
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
    pm25: getSensorValue('pm25'),
    humidity: getSensorValue('humidity'),
    temp: getSensorValue('temp'),
    voc: getSensorValue('voc'),
    radon: getSensorValue('radonShortTermAvg')
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="grid grid-cols-3 gap-2">
        {devices.map(device => (
          <Button
            key={device.serialNumber}
            variant={selectedRoom === device.serialNumber ? "default" : "outline"}
            className="w-full font-bold"
            onClick={() => setSelectedRoom(device.serialNumber)}
          >
            {device.name}
          </Button>
        ))}
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">
              {currentDevice?.name || 'Indendørs luftkvalitet'}
            </CardTitle>
            {currentDevice && (
              <span className="text-sm text-gray-500">
                Opdateret: {currentDevice.lastUpdated}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <GaugeChart
              value={currentData.pm25}
              maxValue={25}
              title="PM2.5"
              unit="µg/m³"
              type="pm25"
            />
            <GaugeChart
              value={currentData.co2}
              maxValue={1500}
              title="CO₂"
              unit="ppm"
              type="co2"
            />
            <GaugeChart
              value={currentData.temp}
              maxValue={30}
              title="Temperatur"
              unit="°C"
              type="temp"
            />
            <GaugeChart
              value={currentData.humidity}
              maxValue={100}
              title="Luftfugtighed"
              unit="%"
              type="humidity"
            />
            <GaugeChart
              value={currentData.voc}
              maxValue={2000}
              title="VOC"
              unit="ppb"
              type="voc"
            />
            <GaugeChart
              value={currentData.radon}
              maxValue={200}
              title="Radon"
              unit="Bq/m³"
              type="radon"
            />
          </div>
        </CardContent>
      </Card>

      {/* Temporarily disabled outdoor air quality
      <Card className="border-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Udendørs luftkvalitet</CardTitle>
            {outdoorLastUpdated && (
              <span className="text-sm text-gray-500">
                Opdateret: {outdoorLastUpdated}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-500">Temperatur</div>
                <div className="text-2xl font-bold">{outdoorData.temperature.toFixed(1)}°C</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-500">Luftfugtighed</div>
                <div className="text-2xl font-bold">{Math.round(outdoorData.humidity)}%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-500">Lufttryk</div>
                <div className="text-2xl font-bold">{Math.round(outdoorData.pressure)} hPa</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-500">PM2.5</div>
                <div className="text-2xl font-bold">{Math.round(outdoorData.pm25)} µg/m³</div>
                <div className="text-sm text-gray-500">AQI: {Math.round(outdoorData.aqius)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-500">PM1</div>
                <div className="text-2xl font-bold">{Math.round(outdoorData.pm1)} µg/m³</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-500">PM10</div>
                <div className="text-2xl font-bold">{Math.round(outdoorData.pm10)} µg/m³</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  );
}