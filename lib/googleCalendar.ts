import { google } from 'googleapis';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

export class GoogleCalendarService {
  private calendar;

  constructor(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }

  // Get list of calendars
  async getCalendars() {
    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      throw error;
    }
  }

  // Get events for a specific date range
  async getEvents(calendarId = 'primary', timeMin?: Date, timeMax?: Date) {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin?.toISOString() || new Date().toISOString(),
        timeMax: timeMax?.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  // Get a single event
  async getEvent(eventId: string, calendarId = 'primary') {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  // Create a new event
  async createEvent(event: CalendarEvent, calendarId = 'primary', addMeet = false) {
    try {
      const eventData: any = { ...event };
      
      // Add Google Meet if requested
      if (addMeet) {
        eventData.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        };
      }

      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: eventData,
        conferenceDataVersion: addMeet ? 1 : 0,
        sendUpdates: 'all',
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Update an existing event
  async updateEvent(eventId: string, event: CalendarEvent, calendarId = 'primary') {
    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: event as any,
        sendUpdates: 'all',
      });
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(eventId: string, calendarId = 'primary') {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all',
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Quick add event (natural language)
  async quickAdd(text: string, calendarId = 'primary') {
    try {
      const response = await this.calendar.events.quickAdd({
        calendarId,
        text,
      });
      return response.data;
    } catch (error) {
      console.error('Error quick adding event:', error);
      throw error;
    }
  }

  // Get free/busy information
  async getFreeBusy(
    calendars: string[],
    timeMin: Date,
    timeMax: Date
  ) {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: calendars.map(id => ({ id })),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching free/busy:', error);
      throw error;
    }
  }

  // Watch for calendar changes
  async watchEvents(calendarId = 'primary', webhookUrl: string) {
    try {
      const response = await this.calendar.events.watch({
        calendarId,
        requestBody: {
          id: `channel-${Date.now()}`,
          type: 'web_hook',
          address: webhookUrl,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error setting up watch:', error);
      throw error;
    }
  }

  // Stop watching calendar changes
  async stopWatch(channelId: string, resourceId: string) {
    try {
      await this.calendar.channels.stop({
        requestBody: {
          id: channelId,
          resourceId: resourceId,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error stopping watch:', error);
      throw error;
    }
  }

  // Get calendar colors
  async getColors() {
    try {
      const response = await this.calendar.colors.get();
      return response.data;
    } catch (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }
  }
}