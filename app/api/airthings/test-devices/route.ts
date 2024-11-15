import { NextResponse } from 'next/server';
import { airthingsApi } from '@/lib/airthings/server-api';

export async function GET() {
  console.log('=== Starting devices test API route ===');
  
  try {
    const accountId = 'a683de8c-5b69-427c-8546-f385feebb6f6';
    console.log(`Testing devices endpoint with account ${accountId}...`);
    
    const devices = await airthingsApi.getDevices(accountId);
    console.log('Successfully fetched devices:', devices);

    return NextResponse.json({
      success: true,
      message: 'Devices test successful',
      devices
    });
  } catch (error: any) {
    console.error('=== Devices test API route error ===');
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
    }

    return NextResponse.json({
      success: false,
      error: 'Devices test failed',
      message: error.message,
      details: error.response?.data || 'No additional details available'
    }, { status: error.response?.status || 500 });
  }
}
