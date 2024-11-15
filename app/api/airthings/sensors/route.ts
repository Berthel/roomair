import { NextResponse } from 'next/server';
import { airthingsApi } from '@/lib/airthings/server-api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const serialNumbers = searchParams.getAll('sn');

    if (!accountId || serialNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Account ID and serial numbers are required' },
        { status: 400 }
      );
    }

    const data = await airthingsApi.getSensors(accountId, serialNumbers);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sensors API route failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor data. Please check server logs for details.' },
      { status: 500 }
    );
  }
}