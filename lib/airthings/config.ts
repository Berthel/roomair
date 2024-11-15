export const AIRTHINGS_CONFIG = {
  baseUrl: process.env.AIRTHINGS_BASE_URL ?? '',
  authUrl: process.env.AIRTHINGS_AUTH_URL ?? '',
  clientId: process.env.AIRTHINGS_CLIENT_ID ?? '',
  clientSecret: process.env.AIRTHINGS_CLIENT_SECRET ?? '',
  scope: process.env.AIRTHINGS_SCOPE ?? ''
} as const;

// Validate configuration
Object.entries(AIRTHINGS_CONFIG).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing environment variable for ${key}`);
  }
});