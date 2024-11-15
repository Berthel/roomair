import { NextResponse } from 'next/server';
import { airthingsApi } from '@/lib/airthings/server-api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const data = await airthingsApi.getDevices(accountId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Devices API route failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices. Please check server logs for details.' },
      { status: 500 }
    );
  }
}