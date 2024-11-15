export const roomData = {
  stue: {
    pm25: { indoor: 12 },
    humidity: 45,
    co2: 800,
    temp: 22.5
  },
  soveværelse: {
    pm25: { indoor: 10 },
    humidity: 42,
    co2: 750,
    temp: 21
  },
  musikrum: {
    pm25: { indoor: 15 },
    humidity: 48,
    co2: 900,
    temp: 23
  }
} as const;

export const outdoorData = {
  pm25: 8,
  temp: 18
} as const;