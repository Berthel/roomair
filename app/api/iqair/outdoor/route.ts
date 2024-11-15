import { NextResponse } from 'next/server';
import { getOutdoorData } from '@/lib/iqair/server-api';

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getOutdoorData();
    console.log('Server API response:', data);
    return NextResponse.json({ 
      success: true, 
      data: {
        current: data // Ensure we wrap the data in a 'current' property
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch outdoor data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch outdoor data',
        details: error.message
      },
      { status: 500 }
    );
  }
}
