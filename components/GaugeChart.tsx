"use client";

import { useEffect, useRef } from 'react';
import { getStatusColor } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  maxValue: number;
  title: string;
  unit: string;
  type: string;
  comparison?: number;
  isOutdoor?: boolean;
}

export default function GaugeChart({ 
  value, 
  maxValue, 
  title, 
  unit, 
  type,
  comparison,
  isOutdoor = false 
}: GaugeChartProps) {
  const rotation = (value / maxValue) * 180;
  const percentage = (value / maxValue) * 100;
  const color = isOutdoor ? '#3b82f6' : getStatusColor(value, type);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="160" height="90" viewBox="0 0 160 90" className="transform transition-all duration-700 ease-in-out">
          {/* Background semicircle */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="rgb(229 231 235)"
            strokeWidth="20"
            strokeLinecap="round"
            className="dark:stroke-gray-700"
          />
          {/* Foreground gauge */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray="220"
            strokeDashoffset={220 - (rotation / 180) * 220}
            className="transition-all duration-700 ease-in-out"
          />
          {/* Value text */}
          <text 
            x="80" 
            y="65" 
            textAnchor="middle" 
            fontSize="20" 
            fontWeight="bold"
            className="fill-gray-900 dark:fill-gray-100"
          >
            {value} {unit}
            {comparison !== undefined && (
              <tspan className="text-sm ml-2 text-gray-500">
                (Ude: {comparison} {unit})
              </tspan>
            )}
          </text>
        </svg>
      </div>
      <div className="mt-2 text-center font-medium text-gray-900 dark:text-gray-100">
        {title}
      </div>
    </div>
  );
}