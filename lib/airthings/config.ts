export const AIRTHINGS_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_AIRTHINGS_BASE_URL ?? '',
  authUrl: process.env.NEXT_PUBLIC_AIRTHINGS_AUTH_URL ?? '',
  clientId: process.env.NEXT_PUBLIC_AIRTHINGS_CLIENT_ID ?? '',
  clientSecret: process.env.NEXT_PUBLIC_AIRTHINGS_CLIENT_SECRET ?? '',
  scope: process.env.NEXT_PUBLIC_AIRTHINGS_SCOPE ?? ''
} as const;

// Validate configuration
Object.entries(AIRTHINGS_CONFIG).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing environment variable for ${key}`);
  }
});