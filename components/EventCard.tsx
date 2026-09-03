"use client";

import { deleteEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { Link, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";

type EventCardEvent = {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  isPrivate: boolean;
  _count: {
    bookings: number;
  };
};

type EventCardProps = {
  event: EventCardEvent;
  username: string | null;
  isPublic?: boolean;
};

const EventCard = ({ event, username, isPublic = false }: EventCardProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const eventPath = username ? `/${username}/${event.id}` : null;

  const handleCopy = async () => {
    if (!eventPath) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${eventPath}`,
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const { loading, fn: fnDeleteEvent } = useFetch(deleteEvent);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    const deleted = await fnDeleteEvent(event.id);
    if (deleted) {
      router.refresh();
    }
  };

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if (
      !eventPath ||
      (e.target instanceof Element && e.target.closest("button"))
    ) {
      return;
    }

    window.open(eventPath, "_blank");
  };

  const descriptionPreview = event.description?.split(".")[0];

  return (
    <Card
      className="flex flex-col justify-between cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <CardTitle className="text-2xl">{event.title}</CardTitle>
        <CardDescription className="flex justify-between">
          <span>
            {event.duration} mins | {event.isPrivate ? "Private" : "Public"}
          </span>
          <span>{event._count.bookings} Bookings</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {descriptionPreview ? <p>{descriptionPreview}.</p> : null}
      </CardContent>
      {!isPublic && (
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex items-center"
          >
            <Link className="mr-2 h-4 w-4" />
            {isCopied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!!loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default EventCard;
