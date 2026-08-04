import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../room/api';
import { fetchMeetings, bookMeeting, cancelMeeting, fetchMeetingStats, updateMeeting } from './api';
import type { Meeting } from './types';
import { toast } from 'sonner';

// ────────────────────────────────────────────────────────
// Room Hooks
// ────────────────────────────────────────────────────────

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 60 * 1000,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoom,
    onSuccess: (room) => {
      toast.success(`Room "${room.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to create room');
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; capacity?: number; description?: string } }) =>
      updateRoom(id, data),
    onSuccess: (room) => {
      toast.success(`Room "${room.name}" updated!`);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to update room');
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      toast.success('Room deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to delete room');
    },
  });
};

// ────────────────────────────────────────────────────────
// Meeting Hooks
// ────────────────────────────────────────────────────────

export const useMeetings = (filters: { date?: string; roomId?: string } = {}) => {
  return useQuery({
    queryKey: ['meetings', filters],
    queryFn: () => fetchMeetings(filters),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
};

export const useBookMeeting = (filters: { date?: string; roomId?: string } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookMeeting,
    onMutate: async (newMeetingDTO) => {
      await queryClient.cancelQueries({ queryKey: ['meetings', filters] });

      const previousMeetings = queryClient.getQueryData<Meeting[]>(['meetings', filters]);

      if (previousMeetings) {
        const tempMeeting: Meeting = {
          _id: `temp-${Date.now()}`,
          title: newMeetingDTO.title,
          room: {
            _id: 'temp-room',
            name: 'Allocating...',
            capacity: 0,
            createdAt: '',
            updatedAt: '',
          },
          startTime: newMeetingDTO.startTime,
          endTime: newMeetingDTO.endTime,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<Meeting[]>(
          ['meetings', filters],
          [...previousMeetings, tempMeeting].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        );
      }

      return { previousMeetings };
    },
    onError: (err: any, _newMeetingDTO, context) => {
      if (context?.previousMeetings) {
        queryClient.setQueryData(['meetings', filters], context.previousMeetings);
      }
      const errMsg = err.message || 'Failed to schedule meeting';
      toast.error(errMsg);
    },
    onSuccess: (data) => {
      toast.success(`Meeting scheduled in room ${data.room.name}!`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-stats'] });
    },
  });
};

export const useUpdateMeeting = (filters: { date?: string; roomId?: string } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { title?: string; startTime?: string; endTime?: string; roomId?: string } }) =>
      updateMeeting(id, dto),
    onSuccess: (data) => {
      toast.success(`Meeting "${data.title}" updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-stats'] });
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.error?.message || err.message || 'Failed to update meeting';
      toast.error(errMsg);
    },
  });
};

export const useCancelMeeting = (filters: { date?: string; roomId?: string } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelMeeting,
    onMutate: async (meetingId) => {
      await queryClient.cancelQueries({ queryKey: ['meetings', filters] });

      const previousMeetings = queryClient.getQueryData<Meeting[]>(['meetings', filters]);

      if (previousMeetings) {
        const updated = previousMeetings.map((m) =>
          m._id === meetingId ? { ...m, status: 'CANCELLED' as const } : m
        );
        queryClient.setQueryData<Meeting[]>(['meetings', filters], updated);
      }

      return { previousMeetings };
    },
    onError: (err: any, _meetingId, context) => {
      if (context?.previousMeetings) {
        queryClient.setQueryData(['meetings', filters], context.previousMeetings);
      }
      const errMsg = err.message || 'Failed to cancel meeting';
      toast.error(errMsg);
    },
    onSuccess: (data) => {
      toast.success(`Meeting "${data.title}" cancelled. Room "${data.room.name}" is now free.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-stats'] });
    },
  });
};

export const useMeetingStats = (date: string) => {
  return useQuery({
    queryKey: ['meeting-stats', date],
    queryFn: () => fetchMeetingStats(date),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });
};
