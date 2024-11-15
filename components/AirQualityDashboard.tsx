"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GaugeChart from '@/components/GaugeChart';
import { roomData, outdoorData } from '@/lib/mock-data';

export default function AirQualityDashboard() {
  const [selectedRoom, setSelectedRoom] = useState('stue');
  const currentData = roomData[selectedRoom];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Select value={selectedRoom} onValueChange={setSelectedRoom}>
        <SelectTrigger className="w-full font-bold">
          <SelectValue placeholder="Vælg rum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="stue" className="font-bold">Stue</SelectItem>
          <SelectItem value="soveværelse" className="font-bold">Soveværelse</SelectItem>
          <SelectItem value="musikrum" className="font-bold">Musikrum</SelectItem>
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