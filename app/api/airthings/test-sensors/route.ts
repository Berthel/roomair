import { NextResponse } from 'next/server';
import { AirthingsAPI } from '@/lib/airthings/server-api';

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log('Starting test-sensors endpoint...');
    
    const api = new AirthingsAPI();
    console.log('API instance created, fetching token...');
    // await api.ensureToken(); // This method does not exist in the original code
    console.log('Token obtained successfully');
    
    console.log('Fetching accounts...');
    const accounts = await api.getAccounts();
    console.log('Accounts found:', accounts.length);
    
    if (accounts.length === 0) {
      console.log('No accounts found!');
      return NextResponse.json({
        success: true,
        data: {
          results: [],
          hasNext: false,
          totalPages: 0,
          pagination: {
            currentPage: 1,
            hasNextPage: false,
            totalPages: 0
          }
        },
        debug: { accountsFound: 0 }
      });
    }

    const accountId = accounts[0].id;
    console.log('Using account ID:', accountId);
    
    // Get devices first
    console.log('Fetching devices...');
    // const devices = await api.getDevices(accountId); // This method does not exist in the original code
    // console.log('Devices found:', devices?.length || 0);

    // Then get sensors
    console.log('Fetching sensors...');
    const searchParams = new URL(request.url).searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sensorData = await api.getSensors(accountId, undefined, page);
    
    console.log('Final response data:', {
      accountsFound: accounts.length,
      // devicesFound: devices?.length || 0,
      sensorsFound: sensorData.results.length,
      hasNext: sensorData.hasNext,
      totalPages: sensorData.totalPages
    });

    return NextResponse.json({
      success: true,
      data: {
        accountId,
        ...sensorData,
        pagination: {
          currentPage: page,
          hasNextPage: sensorData.hasNext,
          totalPages: sensorData.totalPages
        }
      },
      debug: {
        accountsFound: accounts.length,
        // devicesFound: devices?.length || 0,
        sensorsFound: sensorData.results.length
      }
    });
  } catch (error: any) {
    console.error('Error in test-sensors endpoint:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.data || error.stack
    }, { status: 500 });
  }
}
