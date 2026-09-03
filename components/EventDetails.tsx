import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { getEventDetails } from "@/actions/events";
import { Calendar, Clock } from "lucide-react";

type EventDetailsEvent = NonNullable<
  Awaited<ReturnType<typeof getEventDetails>>
>;

type EventDetailsProps = {
  event: EventDetailsEvent;
};

const EventDetails = ({ event }: EventDetailsProps) => {
  const { user } = event;
  const displayName = user.name ?? user.email;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="p-10 lg:w-1/3 bg-white">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <div className="flex items-center mb-4">
        <Avatar className="w-12 h-12 mr-4">
          <AvatarImage src={user.imageUrl ?? undefined} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{displayName}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <Clock className="mr-2" />
        <span>{event.duration} minutes</span>
      </div>
      <div className="flex items-center mb-4">
        <Calendar className="mr-2" />
        <span>Google Meet</span>
      </div>
      <p className="text-gray-700">{event.description}</p>
    </div>
  );
};

export default EventDetails;
