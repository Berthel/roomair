import { NextResponse } from 'next/server';
import { AirthingsAPI } from '@/lib/airthings/server-api';

export async function GET() {
  console.log('=== Starting accounts API route ===');
  
  // Log environment variables for debugging
  console.log('Environment variables check:', {
    baseUrl: process.env.NEXT_PUBLIC_AIRTHINGS_BASE_URL || 'NOT SET',
    authUrl: process.env.NEXT_PUBLIC_AIRTHINGS_AUTH_URL || 'NOT SET',
    scope: process.env.NEXT_PUBLIC_AIRTHINGS_SCOPE || 'NOT SET',
    hasClientId: !!process.env.NEXT_PUBLIC_AIRTHINGS_CLIENT_ID,
    hasClientSecret: !!process.env.NEXT_PUBLIC_AIRTHINGS_CLIENT_SECRET,
  });

  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_AIRTHINGS_BASE_URL) {
      throw new Error('Missing NEXT_PUBLIC_AIRTHINGS_BASE_URL');
    }
    if (!process.env.NEXT_PUBLIC_AIRTHINGS_AUTH_URL) {
      throw new Error('Missing NEXT_PUBLIC_AIRTHINGS_AUTH_URL');
    }
    if (!process.env.NEXT_PUBLIC_AIRTHINGS_CLIENT_ID) {
      throw new Error('Missing NEXT_PUBLIC_AIRTHINGS_CLIENT_ID');
    }
    if (!process.env.NEXT_PUBLIC_AIRTHINGS_CLIENT_SECRET) {
      throw new Error('Missing NEXT_PUBLIC_AIRTHINGS_CLIENT_SECRET');
    }
    if (!process.env.NEXT_PUBLIC_AIRTHINGS_SCOPE) {
      throw new Error('Missing NEXT_PUBLIC_AIRTHINGS_SCOPE');
    }

    console.log('Creating AirthingsAPI instance...');
    const api = new AirthingsAPI();
    
    console.log('Calling getAccounts...');
    const accounts = await api.getAccounts();
    
    console.log('Accounts retrieved successfully:', accounts);
    return NextResponse.json(accounts);
  } catch (error: any) {
    // Log detailed error information
    console.error('=== Accounts API route error ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n')
    });
    
    if (error.response) {
      console.error('API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        request: {
          method: error.response.config?.method,
          url: error.response.config?.url,
          headers: error.response.config?.headers,
          data: error.response.config?.data
        }
      });

      // Return error response with details
      return NextResponse.json(
        {
          error: 'API Error',
          message: error.message,
          details: error.response.data,
          status: error.response.status
        },
        { status: error.response.status }
      );
    } else if (error.request) {
      console.error('API Request Error (no response received):', {
        method: error.request?.method,
        path: error.request?.path,
        host: error.request?.host,
        protocol: error.request?.protocol,
        headers: error.request?.headers
      });

      // Return error response for request error
      return NextResponse.json(
        {
          error: 'Request Error',
          message: 'No response received from API',
          details: error.message
        },
        { status: 502 }
      );
    }

    // Return generic error response
    console.error('General Error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}