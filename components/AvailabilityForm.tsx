"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { updateAvailability } from "@/actions/availability";
import { timeSlots } from "@/constants/availability";
import useFetch from "@/hooks/useFetch";
import { availabilitySchema, type AvailabilityInput } from "@/lib/validators";

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type AvailabilityFormProps = {
  initialData: AvailabilityInput;
};

const AvailabilityForm = ({ initialData }: AvailabilityFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AvailabilityInput>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: initialData,
  });

  const {
    loading,
    error,
    fn: fnupdateAvailability,
  } = useFetch(updateAvailability);

  const onSubmit = async (data: AvailabilityInput) => {
    await fnupdateAvailability(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {WEEKDAYS.map((day) => (
        <div key={day} className="flex items-center space-x-4 mb-4">
          <Controller
            name={`${day}.isAvailable`}
            control={control}
            render={({ field }) => (
              <>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    const isAvailable = checked === true;
                    field.onChange(isAvailable);
                    if (!isAvailable) {
                      setValue(`${day}.startTime`, "09:00");
                      setValue(`${day}.endTime`, "17:00");
                    }
                  }}
                />
                <span className="w-24">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
                {field.value ? (
                  <>
                    <Controller
                      name={`${day}.startTime`}
                      control={control}
                      render={({ field: startField }) => (
                        <Select
                          onValueChange={startField.onChange}
                          value={startField.value ?? "09:00"}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Start Time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <span>to</span>
                    <Controller
                      name={`${day}.endTime`}
                      control={control}
                      render={({ field: endField }) => (
                        <Select
                          onValueChange={endField.onChange}
                          value={endField.value ?? "17:00"}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="End Time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors[day]?.endTime && (
                      <span className="text-red-500 text-sm ml-2">
                        {errors[day].endTime.message}
                      </span>
                    )}
                  </>
                ) : null}
              </>
            )}
          />
        </div>
      ))}

      <div className="flex items-center space-x-4">
        <span className="w-48">Minimum gap before booking (minutes):</span>

        <Input
          type="number"
          {...register("timeGap", {
            valueAsNumber: true,
          })}
          className="w-32"
        />

        {errors.timeGap && (
          <span className="text-red-500 text-sm">{errors.timeGap.message}</span>
        )}
      </div>
      {error && <div className="text-red-500 text-sm">{error.message}</div>}
      <Button type="submit" disabled={!!loading}>
        {loading ? "Updating..." : "Update Availability"}
      </Button>
    </form>
  );
};

export default AvailabilityForm;
