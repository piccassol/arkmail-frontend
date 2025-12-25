import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { google } from 'googleapis';

// GET /api/calendar - Get calendar events
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // You'll need to get the Google access token from your backend or Clerk
    // This depends on how you're storing OAuth tokens with Clerk
    const backendToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!backendToken) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering events
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();
    const timeMax = searchParams.get('timeMax');
    const maxResults = searchParams.get('maxResults') || '50';

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // You'll need to get these tokens from your backend
    oauth2Client.setCredentials({
      access_token: backendToken,
    });

    // Create calendar instance
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Fetch events from primary calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax || undefined,
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json(response.data.items || []);
  } catch (error: any) {
    console.error('Calendar API Error:', error);
    
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return NextResponse.json(
        { error: 'Authentication expired. Please sign in again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// POST /api/calendar - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const backendToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!backendToken) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { event, calendarId, addMeet } = body;

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: backendToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Prepare event data
    const eventData: any = {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start,
      end: event.end,
      attendees: event.attendees || [],
    };

    // Add Google Meet if requested
    if (addMeet) {
      eventData.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    // Create the event
    const response = await calendar.events.insert({
      calendarId: calendarId || 'primary',
      requestBody: eventData,
      conferenceDataVersion: addMeet ? 1 : 0,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Create Event Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}