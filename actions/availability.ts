"use server";

import { db } from "@/lib/prisma";
import { availabilitySchema, type AvailabilityInput } from "@/lib/validators";
import { auth } from "@clerk/nextjs/server";
import { DayOfWeek } from "@prisma/client";
import {
  addDays,
  addMinutes,
  format,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type Weekday = (typeof WEEKDAYS)[number];

const toDayOfWeek = (day: Weekday): DayOfWeek => day.toUpperCase() as DayOfWeek;

type BookingWindow = {
  startTime: Date;
  endTime: Date;
};

type AvailableDate = {
  date: string;
  slots: string[];
};

export const getUserAvailability = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      availability: {
        include: { days: true },
      },
    },
  });

  if (!user?.availability) {
    return null;
  }

  const { availability } = user;
  const availabilityData = {
    timeGap: availability.timeGap,
  } as AvailabilityInput;

  for (const day of WEEKDAYS) {
    const dayAvailability = availability.days.find(
      (d) => d.day === toDayOfWeek(day),
    );

    availabilityData[day] = {
      isAvailable: !!dayAvailability,
      startTime: dayAvailability
        ? dayAvailability.startTime.toISOString().slice(11, 16)
        : "09:00",
      endTime: dayAvailability
        ? dayAvailability.endTime.toISOString().slice(11, 16)
        : "17:00",
    };
  }

  return availabilityData;
};

export const updateAvailability = async (data: AvailabilityInput) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = availabilitySchema.parse(data);

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { availability: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const baseDate = format(new Date(), "yyyy-MM-dd");

  const availabilityDays = WEEKDAYS.flatMap((day) => {
    const { isAvailable, startTime, endTime } = validatedData[day];

    if (!isAvailable || !startTime || !endTime) {
      return [];
    }

    return [
      {
        day: toDayOfWeek(day),
        startTime: new Date(`${baseDate}T${startTime}:00Z`),
        endTime: new Date(`${baseDate}T${endTime}:00Z`),
      },
    ];
  });

  if (user.availability) {
    await db.availability.update({
      where: { id: user.availability.id },
      data: {
        timeGap: validatedData.timeGap,
        days: {
          deleteMany: {},
          create: availabilityDays,
        },
      },
    });
  } else {
    await db.availability.create({
      data: {
        userId: user.id,
        timeGap: validatedData.timeGap,
        days: {
          create: availabilityDays,
        },
      },
    });
  }

  return { success: true } as const;
};

export const getEventAvailability = async (eventId: string) => {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      user: {
        include: {
          availability: {
            select: {
              days: true,
              timeGap: true,
            },
          },
          bookings: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
        },
      },
    },
  });

  if (!event?.user.availability) {
    return [];
  }

  const { availability, bookings } = event.user;
  const startDate = startOfDay(new Date());
  const endDate = addDays(startDate, 30);
  const availableDates: AvailableDate[] = [];

  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const dayOfWeek = format(date, "EEEE").toUpperCase() as DayOfWeek;
    const dayAvailability = availability.days.find((d) => d.day === dayOfWeek);

    if (dayAvailability) {
      const dateStr = format(date, "yyyy-MM-dd");

      const slots = generateAvailableTimeSlots(
        dayAvailability.startTime,
        dayAvailability.endTime,
        event.duration,
        bookings,
        dateStr,
        availability.timeGap,
      );

      availableDates.push({
        date: dateStr,
        slots,
      });
    }
  }

  return availableDates;
};

const generateAvailableTimeSlots = (
  startTime: Date,
  endTime: Date,
  duration: number,
  bookings: BookingWindow[],
  dateStr: string,
  timeGap = 0,
) => {
  const slots: string[] = [];
  let currentTime = parseISO(
    `${dateStr}T${startTime.toISOString().slice(11, 16)}`,
  );
  const slotEndTime = parseISO(
    `${dateStr}T${endTime.toISOString().slice(11, 16)}`,
  );

  const now = new Date();
  if (format(now, "yyyy-MM-dd") === dateStr) {
    currentTime = isBefore(currentTime, now)
      ? addMinutes(now, timeGap)
      : currentTime;
  }

  while (currentTime < slotEndTime) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);

    const isSlotAvailable = !bookings.some((booking) => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;
      return (
        (currentTime >= bookingStart && currentTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (currentTime <= bookingStart && slotEnd >= bookingEnd)
      );
    });

    if (isSlotAvailable) {
      slots.push(format(currentTime, "HH:mm"));
    }

    currentTime = slotEnd;
  }

  return slots;
};
