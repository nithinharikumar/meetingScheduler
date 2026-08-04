import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBookMeeting } from '../../entities/meeting/hooks';
import { useUIStore } from '../../shared/hooks/useUIStore';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/form/Input';

const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const formSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Meeting title is required')
      .max(100, 'Title cannot exceed 100 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    startTime: z.string().regex(timeRegex, 'Must be in HH:MM format'),
    endDate: z.string().min(1, 'End date is required'),
    endTime: z.string().regex(timeRegex, 'Must be in HH:MM format'),
  })
  .refine(
    (data) => {
      const startDateTime = new Date(`${data.startDate}T${data.startTime}:00`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}:00`);
      return endDateTime > startDateTime;
    },
    {
      message: 'End date/time must be after start date/time',
      path: ['endTime'],
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface CreateMeetingFormProps {
  onSuccess: () => void;
}

export const CreateMeetingForm: React.FC<CreateMeetingFormProps> = ({ onSuccess }) => {
  const selectedDate = useUIStore((state) => state.selectedDate);
  const { mutateAsync: bookMeeting, isPending } = useBookMeeting({ date: selectedDate });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      startDate: selectedDate,
      startTime: '09:00',
      endDate: selectedDate,
      endTime: '10:00',
    },
  });

  // Reset form default values when active calendar date changes
  useEffect(() => {
    reset({
      title: '',
      startDate: selectedDate,
      startTime: '09:00',
      endDate: selectedDate,
      endTime: '10:00',
    });
  }, [selectedDate, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const startISO = new Date(`${values.startDate}T${values.startTime}:00`).toISOString();
      const endISO = new Date(`${values.endDate}T${values.endTime}:00`).toISOString();

      await bookMeeting({
        title: values.title,
        startTime: startISO,
        endTime: endISO,
      });

      reset();
      onSuccess();
    } catch (err) {
      // Error already toasted by mutation hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      {/* Meeting Title Input */}
      <Input
        label="Meeting Title"
        id="title"
        placeholder="e.g. Sprint Planning"
        error={errors.title}
        required
        {...register('title')}
      />

      {/* Start Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          id="startDate"
          type="date"
          required
          error={errors.startDate}
          {...register('startDate')}
        />
        <Input
          label="Start Time"
          id="startTime"
          type="time"
          required
          error={errors.startTime}
          {...register('startTime')}
        />
      </div>

      {/* End Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="End Date"
          id="endDate"
          type="date"
          required
          error={errors.endDate}
          {...register('endDate')}
        />
        <Input
          label="End Time"
          id="endTime"
          type="time"
          required
          error={errors.endTime}
          {...register('endTime')}
        />
      </div>

      {/* Submission Actions */}
      <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
        <Button
          type="submit"
          loading={isPending}
          className="w-full sm:w-auto font-semibold px-5"
        >
          Schedule Meeting
        </Button>
      </div>
    </form>
  );
};
