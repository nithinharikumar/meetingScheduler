import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBookMeeting } from '../../entities/meeting/hooks';
import { useUIStore } from '../../shared/hooks/useUIStore';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';

const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const formSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Meeting title is required')
      .max(100, 'Title cannot exceed 100 characters'),
    startTime: z.string().regex(timeRegex, 'Must be in HH:MM format'),
    endTime: z.string().regex(timeRegex, 'Must be in HH:MM format'),
  })
  .refine(
    (data) => {
      const [startH, startM] = data.startTime.split(':').map(Number);
      const [endH, endM] = data.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return endMinutes > startMinutes;
    },
    {
      message: 'End time must be after start time',
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
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Construct full ISO strings
      // selectedDate is in format YYYY-MM-DD
      const startISO = new Date(`${selectedDate}T${values.startTime}:00`).toISOString();
      const endISO = new Date(`${selectedDate}T${values.endTime}:00`).toISOString();

      await bookMeeting({
        title: values.title,
        startTime: startISO,
        endTime: endISO,
      });

      reset();
      onSuccess();
    } catch (err) {
      // Error is already handled/toasted by the useBookMeeting hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="title">
          Meeting Title
        </label>
        <Input
          id="title"
          placeholder="e.g. Sprint Planning"
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1" htmlFor="startTime">
            Start Time
          </label>
          <Input
            id="startTime"
            type="time"
            {...register('startTime')}
            aria-invalid={!!errors.startTime}
          />
          {errors.startTime && (
            <p className="text-xs text-destructive mt-1">{errors.startTime.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1" htmlFor="endTime">
            End Time
          </label>
          <Input
            id="endTime"
            type="time"
            {...register('endTime')}
            aria-invalid={!!errors.endTime}
          />
          {errors.endTime && (
            <p className="text-xs text-destructive mt-1">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? 'Scheduling...' : 'Schedule Meeting'}
        </Button>
      </div>
    </form>
  );
};
