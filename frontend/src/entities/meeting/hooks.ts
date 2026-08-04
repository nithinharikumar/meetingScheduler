import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRooms } from '../room/api';
import { fetchMeetings, bookMeeting, cancelMeeting, fetchMeetingStats } from './api';
import type { Meeting } from './types';
import { toast } from 'sonner';

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 60 * 1000, // Rooms are static, cache for 1 minute
  });
};

export const useMeetings = (filters: { date?: string; roomId?: string } = {}) => {
  return useQuery({
    queryKey: ['meetings', filters],
    queryFn: () => fetchMeetings(filters),
    staleTime: 15 * 1000, // Fresh for 15 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds in background
  });
};

export const useBookMeeting = (filters: { date?: string; roomId?: string } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookMeeting,
    onMutate: async (newMeetingDTO) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['meetings', filters] });

      // Snapshot previous meetings
      const previousMeetings = queryClient.getQueryData<Meeting[]>(['meetings', filters]);

      // Optimistically insert the new meeting
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
      // Rollback to previous state
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
      // Refetch meetings and rooms to make sure we're in sync
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-stats'] });
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
        // Optimistically change meeting status to cancelled
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
    staleTime: 10 * 1000, // Stats stay fresh for 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};
