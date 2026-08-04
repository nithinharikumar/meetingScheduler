import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateMeeting, useRooms } from '../../entities/meeting/hooks';
import type { Meeting } from '../../entities/meeting/types';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/form/Input';
import { Select } from '../../shared/ui/form/Select';

const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const editMeetingSchema = z
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
    roomId: z.string().min(1, 'Room is required'),
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

type FormValues = z.infer<typeof editMeetingSchema>;

const toDateStr = (iso: string) => {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTimeStr = (iso: string) => {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

interface EditMeetingFormProps {
  meeting: Meeting;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditMeetingForm: React.FC<EditMeetingFormProps> = ({ meeting, onSuccess, onCancel }) => {
  const { mutateAsync: updateMeeting, isPending } = useUpdateMeeting();
  const { data: rooms = [] } = useRooms();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(editMeetingSchema),
    defaultValues: {
      title: meeting.title,
      startDate: toDateStr(meeting.startTime),
      startTime: toTimeStr(meeting.startTime),
      endDate: toDateStr(meeting.endTime),
      endTime: toTimeStr(meeting.endTime),
      roomId: meeting.room._id,
    },
  });

  // Re-sync defaults if the meeting prop changes (e.g. user switches which meeting to edit)
  useEffect(() => {
    reset({
      title: meeting.title,
      startDate: toDateStr(meeting.startTime),
      startTime: toTimeStr(meeting.startTime),
      endDate: toDateStr(meeting.endTime),
      endTime: toTimeStr(meeting.endTime),
      roomId: meeting.room._id,
    });
  }, [meeting._id, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const startISO = new Date(`${values.startDate}T${values.startTime}:00`).toISOString();
      const endISO = new Date(`${values.endDate}T${values.endTime}:00`).toISOString();

      await updateMeeting({
        id: meeting._id,
        dto: {
          title: values.title,
          startTime: startISO,
          endTime: endISO,
          roomId: values.roomId,
        },
      });

      onSuccess();
    } catch {
      // Error already toasted by mutation hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      {/* Meeting Title */}
      <Input
        label="Meeting Title"
        id="edit-title"
        placeholder="e.g. Sprint Planning"
        error={errors.title}
        required
        {...register('title')}
      />

      {/* Room Selection */}
      <Select
        label="Meeting Room"
        id="edit-roomId"
        error={errors.roomId}
        {...register('roomId')}
      >
        <option value="">Select a room...</option>
        {rooms.map((room) => (
          <option key={room._id} value={room._id}>
            {room.name} (Capacity: {room.capacity})
          </option>
        ))}
      </Select>

      {/* Start Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          id="edit-startDate"
          type="date"
          required
          error={errors.startDate}
          {...register('startDate')}
        />
        <Input
          label="Start Time"
          id="edit-startTime"
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
          id="edit-endDate"
          type="date"
          required
          error={errors.endDate}
          {...register('endDate')}
        />
        <Input
          label="End Time"
          id="edit-endTime"
          type="time"
          required
          error={errors.endTime}
          {...register('endTime')}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-9 px-4 text-xs font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isPending}
          className="h-9 px-5 text-xs font-semibold"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};
