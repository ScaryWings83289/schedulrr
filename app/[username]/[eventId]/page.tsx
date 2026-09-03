import { getEventAvailability } from "@/actions/availability";
import { getEventDetails } from "@/actions/events";
import BookingForm from "@/components/BookingForm";
import EventDetails from "@/components/EventDetails";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const generateMetadata = async ({
  params,
}: PageProps<"/[username]/[eventId]">): Promise<Metadata> => {
  const { username, eventId } = await params;
  const event = await getEventDetails(username, eventId);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  const hostName = event.user.name ?? event.user.email;

  return {
    title: `Book ${event.title} with ${hostName} | Schedulrr`,
    description: `Schedule a ${event.duration}-minute ${event.title} event with ${hostName}.`,
  };
};

const EventBookingPage = async ({
  params,
}: PageProps<"/[username]/[eventId]">) => {
  const { username, eventId } = await params;
  const [event, availability] = await Promise.all([
    getEventDetails(username, eventId),
    getEventAvailability(eventId),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col justify-center lg:flex-row px-4 py-8">
      <EventDetails event={event} />
      <Suspense fallback={<div>Loading booking form...</div>}>
        <BookingForm event={event} availability={availability} />
      </Suspense>
    </div>
  );
};

export default EventBookingPage;
