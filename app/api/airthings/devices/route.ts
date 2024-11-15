import { NextResponse } from 'next/server';
import { airthingsApi } from '@/lib/airthings/server-api';

export async function GET(request: Request) {
  console.log('=== Starting devices API route ===');
  
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    console.log('Request params:', { accountId });

    if (!accountId) {
      console.log('Missing accountId parameter');
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching devices for account:', accountId);
    const data = await airthingsApi.getDevices(accountId);
    console.log('Devices fetched successfully:', data);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('=== Devices API route error ===');
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
    } else if (error.request) {
      console.error('API Request Error (no response received):', {
        method: error.request?.method,
        path: error.request?.path,
        host: error.request?.host,
        protocol: error.request?.protocol,
        headers: error.request?.headers
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch devices',
        message: error.message,
        details: error.response?.data || error.request || 'No additional details available',
        timestamp: new Date().toISOString()
      },
      { status: error.response?.status || 500 }
    );
  }
}