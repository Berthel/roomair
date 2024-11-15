import { NextResponse } from 'next/server';
import { airthingsApi } from '@/lib/airthings/server-api';

export async function GET() {
  try {
    const data = await airthingsApi.getAccounts();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Accounts API route failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts. Please check server logs for details.' },
      { status: 500 }
    );
  }
}