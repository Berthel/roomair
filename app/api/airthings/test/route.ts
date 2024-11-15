import { NextResponse } from 'next/server';
import { airthingsApi } from '@/lib/airthings/server-api';

export async function GET() {
  console.log('=== Starting test API route ===');
  
  try {
    // First, try to get accounts to test authentication
    console.log('Testing accounts endpoint...');
    const accounts = await airthingsApi.getAccounts();
    console.log('Successfully fetched accounts:', accounts);

    // Return success even if we don't have any accounts
    // This helps us verify that authentication works
    return NextResponse.json({
      success: true,
      message: 'API test successful - authentication works',
      accounts
    });

  } catch (error: any) {
    console.error('=== Test API route error ===');
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
      error: 'API test failed',
      message: error.message,
      details: error.response?.data || 'No additional details available'
    }, { status: error.response?.status || 500 });
  }
}
