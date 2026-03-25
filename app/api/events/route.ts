import { NextResponse } from 'next/server';
import { getEvents, getAttendanceData, addEvent, getActiveEvent, setActiveEvent } from '@/lib/google-sheets';

export async function GET() {
  try {
    const events = await getEvents();
    const attendanceData = await getAttendanceData();
    const activeEvent = await getActiveEvent();
    return NextResponse.json({ events, attendanceData, activeEvent });
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { eventName, setActive } = await request.json();
    
    if (setActive) {
      await setActiveEvent(eventName);
      return NextResponse.json({ success: true });
    }

    if (!eventName) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }
    await addEvent(eventName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Events POST error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
