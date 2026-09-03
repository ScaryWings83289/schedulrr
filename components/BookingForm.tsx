"use client";

import type { getEventAvailability } from "@/actions/availability";
import { createBooking } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/useFetch";
import { bookingSchema, type BookingInput } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useForm } from "react-hook-form";

type BookingFormEvent = {
  id: string;
  duration: number;
};

type AvailabilityDay = Awaited<ReturnType<typeof getEventAvailability>>[number];

type BookingFormProps = {
  event: BookingFormEvent;
  availability: AvailabilityDay[];
};

const BookingForm = ({ event, availability }: BookingFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
  });

  const { loading, data, fn: fnCreateBooking } = useFetch(createBooking);

  const onSubmit = async (formData: BookingInput) => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    const startTime = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}`,
    );
    const endTime = new Date(startTime.getTime() + event.duration * 60000);

    await fnCreateBooking({
      eventId: event.id,
      name: formData.name,
      email: formData.email,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      additionalInfo: formData.additionalInfo,
    });
  };

  const availableDays = availability.map((day) => new Date(day.date));

  const timeSlots = selectedDate
    ? (availability.find(
      (day) => day.date === format(selectedDate, "yyyy-MM-dd"),
    )?.slots ?? [])
    : [];

  if (data?.success) {
    return (
      <div className="text-center p-10 border bg-white">
        <h2 className="text-2xl font-bold mb-4">Booking successful!</h2>
        {data.meetLink && (
          <p>
            Join the meeting:{" "}
            <a
              href={data.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {data.meetLink}
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-10 border bg-white">
      <div className="md:h-82 flex flex-col md:flex-row gap-5 ">
        <div className="w-full">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setSelectedTime(undefined);
              if (date) {
                setValue("date", format(date, "yyyy-MM-dd"));
              }
            }}
            disabled={[{ before: new Date() }]}
            modifiers={{ available: availableDays }}
            modifiersStyles={{
              available: {
                background: "lightblue",
                borderRadius: 100,
              },
            }}
          />
        </div>
        <div className="w-full h-full md:overflow-scroll no-scrollbar">
          {selectedDate && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Available Time Slots
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? "default" : "outline"}
                    onClick={() => {
                      setSelectedTime(slot);
                      setValue("time", slot);
                    }}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {data && !data.success && (
        <p className="text-red-500 text-sm">{data.error}</p>
      )}
      {selectedTime && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input {...register("name")} placeholder="Your Name" />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Input
              {...register("email")}
              type="email"
              placeholder="Your Email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Textarea
              {...register("additionalInfo")}
              placeholder="Additional Information"
            />
          </div>
          <Button type="submit" disabled={!!loading} className="w-full">
            {loading ? "Scheduling..." : "Schedule Event"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default BookingForm;
