import { getUserEvents } from "@/actions/events";
import EventCard from "@/components/EventCard";
import { Suspense } from "react";

const Events = async () => {
  const { events, username } = await getUserEvents();

  if (events.length === 0) {
    return <p>You haven&apos;t created any events yet.</p>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {events?.map((event) => (
        <EventCard key={event.id} event={event} username={username} isPublic={false} />
      ))}
    </div>
  );
};

const EventsPage = () => {
  return (
    <Suspense fallback={<div>Loading events...</div>}>
      <Events />
    </Suspense>
  );
};

export default EventsPage;