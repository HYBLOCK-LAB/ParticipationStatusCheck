import { NextResponse } from 'next/server';
import { checkIn } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const { name, event } = await request.json();

    if (!name || !event) {
      return NextResponse.json({ error: 'Name and event are required.' }, { status: 400 });
    }

    const result = await checkIn(name, event);

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'User not found in spreadsheet.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Failed to update attendance.' }, { status: 500 });
  }
}
