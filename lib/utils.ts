import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(value: number, type: string) {
  const thresholds = {
    co2: { good: 800, warning: 1000 },
    pm25: { good: 10, warning: 15 },
    humidity: { good: 40, warning: 60 },
    temp: { low: 20, highGood: 23, warning: 25 }
  } as const;
  
  if (type === 'temp') {
    if (value < thresholds.temp.low) return '#fbbf24';
    if (value < thresholds.temp.highGood) return '#22c55e';
    if (value < thresholds.temp.warning) return '#fbbf24';
    return '#ef4444';
  }
  
  if (value < thresholds[type as keyof typeof thresholds].good) return '#22c55e';
  if (value < thresholds[type as keyof typeof thresholds].warning) return '#fbbf24';
  return '#ef4444';
}