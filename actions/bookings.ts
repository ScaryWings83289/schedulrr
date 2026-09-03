"use server";

import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";

export type CreateBookingInput = {
  eventId: string;
  name: string;
  email: string;
  startTime: string;
  endTime: string;
  additionalInfo?: string;
};

export const createBooking = async (bookingData: CreateBookingInput) => {
  try {
    const event = await db.event.findUnique({
      where: { id: bookingData.eventId },
      include: { user: true },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    const client = await clerkClient();
    const { data } = await client.users.getUserOauthAccessToken(
      event.user.clerkUserId,
      "google",
    );

    const token = data[0]?.token;

    if (!token) {
      throw new Error("Event creator has not connected Google Calendar");
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const meetResponse = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: `${bookingData.name} - ${event.title}`,
        description: bookingData.additionalInfo,
        start: { dateTime: bookingData.startTime },
        end: { dateTime: bookingData.endTime },
        attendees: [
          { email: bookingData.email, responseStatus: "accepted" },
          { email: event.user.email, responseStatus: "accepted" },
        ],
        guestsCanModify: false,
        conferenceData: {
          createRequest: { requestId: `${event.id}-${Date.now()}` },
        },
      },
    });

    const meetLink = meetResponse.data.hangoutLink;
    const googleEventId = meetResponse.data.id;

    if (!meetLink || !googleEventId) {
      throw new Error("Failed to create Google Meet link");
    }

    const booking = await db.booking.create({
      data: {
        eventId: event.id,
        userId: event.userId,
        name: bookingData.name,
        email: bookingData.email,
        startTime: new Date(bookingData.startTime),
        endTime: new Date(bookingData.endTime),
        additionalInfo: bookingData.additionalInfo,
        meetLink,
        googleEventId,
      },
    });

    return { success: true as const, booking, meetLink };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to create booking",
    };
  }
};
