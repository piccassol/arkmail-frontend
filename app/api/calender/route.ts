import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { GoogleCalendarService } from '@/lib/googleCalendar';

// GET /api/calendar - Get calendars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const calendarService = new GoogleCalendarService(session.accessToken);
    const calendars = await calendarService.getCalendars();

    return NextResponse.json(calendars);
  } catch (error: any) {
    console.error('Calendar API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendars' },
      { status: 500 }
    );
  }
}

// POST /api/calendar - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { event, calendarId, addMeet } = body;

    const calendarService = new GoogleCalendarService(session.accessToken);
    const createdEvent = await calendarService.createEvent(
      event,
      calendarId || 'primary',
      addMeet || false
    );

    return NextResponse.json(createdEvent);
  } catch (error: any) {
    console.error('Create Event Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}