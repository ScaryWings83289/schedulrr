import { getUserByUsername } from "@/actions/users";
import EventCard from "@/components/EventCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const generateMetadata = async ({
  params,
}: PageProps<"/[username]">): Promise<Metadata> => {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  const displayName = user.name ?? username;

  return {
    title: `${displayName}'s Profile | Schedulrr`,
    description: `Book an event with ${displayName}. View available public events and schedules.`,
  };
};

const UserProfilePage = async ({ params }: PageProps<"/[username]">) => {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const displayName = user.name ?? username;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex flex-col items-center mb-8'>
        <Avatar className='w-24 h-24 mb-4'>
          <AvatarImage src={user.imageUrl ?? undefined} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <h1 className='text-3xl font-bold mb-2'>{displayName}</h1>
        <p className='text-gray-600 text-center'>
          Welcome to my scheduling page. Please select an event below to book a
          call with me.
        </p>
      </div>

      {user.events.length === 0 ? (
        <p className='text-center text-gray-600'>No public events available.</p>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {user.events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              username={username}
              isPublic
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
