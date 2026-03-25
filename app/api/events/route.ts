import { NextResponse } from 'next/server';
import { getEvents, getAttendanceData, addEvent } from '@/lib/google-sheets';

export async function GET() {
  try {
    const events = await getEvents();
    const attendanceData = await getAttendanceData();
    return NextResponse.json({ events, attendanceData });
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { eventName } = await request.json();
    if (!eventName) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }
    await addEvent(eventName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Events POST error:', error);
    return NextResponse.json({ error: 'Failed to add event' }, { status: 500 });
  }
}
