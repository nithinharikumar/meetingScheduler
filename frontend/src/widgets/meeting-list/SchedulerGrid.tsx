import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeetings, useRooms, useCancelMeeting } from '../../entities/meeting/hooks';
import { useUIStore } from '../../shared/hooks/useUIStore';
import type { Meeting } from '../../entities/meeting/types';
import { Button } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Trash2, Users, Clock, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../shared/ui/dialog';

const START_HOUR = 8; // 8:00 AM
const END_HOUR = 22; // 10:00 PM
const HOUR_HEIGHT = 72; // height in pixels of 1 hour block

export const SchedulerGrid: React.FC = () => {
  const selectedDate = useUIStore((state) => state.selectedDate);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const selectedRoomId = useUIStore((state) => state.selectedRoomId);

  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: meetings = [], isLoading: meetingsLoading } = useMeetings({ date: selectedDate });
  const { mutateAsync: cancelMeeting } = useCancelMeeting({ date: selectedDate });

  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  // Generate hours array
  const hours = useMemo(() => {
    const list = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      list.push(h);
    }
    return list;
  }, []);

  // Filter meetings based on search query and room filter
  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRoom = !selectedRoomId || meeting.room._id === selectedRoomId;
      const isConfirmed = meeting.status === 'CONFIRMED';
      return matchesSearch && matchesRoom && isConfirmed;
    });
  }, [meetings, searchQuery, selectedRoomId]);

  // Map meetings to their respective rooms
  const meetingsByRoom = useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    rooms.forEach((r) => {
      map[r._id] = [];
    });
    filteredMeetings.forEach((m) => {
      const rId = typeof m.room === 'string' ? m.room : m.room._id;
      if (map[rId]) {
        map[rId].push(m);
      }
    });
    return map;
  }, [rooms, filteredMeetings]);

  // Check if a meeting fits inside the visible timeframe (08:00 - 22:00)
  // Calculate relative top & height offsets
  const getMeetingCoordinates = (meeting: Meeting) => {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);

    const startH = start.getHours();
    const startM = start.getMinutes();
    const endH = end.getHours();
    const endM = end.getMinutes();

    // Convert start and end times to minutes from day-start (START_HOUR:00)
    const dayStartMin = START_HOUR * 60;
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    const top = ((startMin - dayStartMin) / 60) * HOUR_HEIGHT;
    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;

    return { top, height };
  };

  const handleCancelClick = (meeting: Meeting, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMeeting(meeting);
    setIsConfirmCancelOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (activeMeeting) {
      await cancelMeeting(activeMeeting._id);
      setIsConfirmCancelOpen(false);
      setActiveMeeting(null);
    }
  };

  if (roomsLoading || meetingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground text-sm animate-pulse">Loading Schedule Grid...</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border border-border shadow-md bg-card/60 backdrop-blur-md">
      <div className="overflow-x-auto min-w-full">
        {/* Scheduler Header row */}
        <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border min-w-[900px] sticky top-0 bg-card z-10">
          <div className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center">
            Time
          </div>
          {rooms.map((room) => (
            <div
              key={room._id}
              className={`p-4 border-l border-border flex flex-col justify-center ${
                selectedRoomId && selectedRoomId !== room._id ? 'opacity-40' : ''
              }`}
            >
              <span className="font-semibold text-sm">{room.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5" /> Cap: {room.capacity}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline Grid Content */}
        <div
          className="grid grid-cols-[80px_repeat(5,1fr)] relative min-w-[900px]"
          style={{ height: `${hours.length * HOUR_HEIGHT}px` }}
        >
          {/* Time Slots Labels and horizontal row grids */}
          {hours.map((hour, idx) => {
            const timeLabel = hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
            return (
              <React.Fragment key={hour}>
                {/* Horizontal row divider grid line */}
                <div
                  className="absolute left-0 right-0 border-b border-border/40 pointer-events-none"
                  style={{ top: `${(idx + 1) * HOUR_HEIGHT}px` }}
                ></div>
                {/* Time Indicator Label */}
                <div
                  className="flex items-start justify-center text-xs text-muted-foreground font-medium pt-1.5"
                  style={{
                    position: 'absolute',
                    top: `${idx * HOUR_HEIGHT}px`,
                    height: `${HOUR_HEIGHT}px`,
                    width: '80px',
                  }}
                >
                  {timeLabel}
                </div>
              </React.Fragment>
            );
          })}

          {/* Vertical room divider grid lines */}
          {rooms.map((_, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 border-l border-border/40 pointer-events-none"
              style={{ left: `calc(80px + ${idx} * (100% - 80px) / 5)` }}
            ></div>
          ))}

          {/* Absolute positioned scheduled meetings */}
          <div className="absolute inset-0 left-[80px] pointer-events-none">
            <div className="relative w-full h-full">
              {rooms.map((room, roomIdx) => {
                const roomMeetings = meetingsByRoom[room._id] || [];
                const roomWidthPercentage = 100 / 5;
                const roomLeftOffset = roomIdx * roomWidthPercentage;

                return (
                  <div
                    key={room._id}
                    className="absolute top-0 bottom-0 pointer-events-auto"
                    style={{
                      left: `${roomLeftOffset}%`,
                      width: `${roomWidthPercentage}%`,
                    }}
                  >
                    <AnimatePresence>
                      {roomMeetings.map((meeting) => {
                        const { top, height } = getMeetingCoordinates(meeting);

                        // If meeting starts before START_HOUR or after END_HOUR, skip/clamp
                        if (top < 0 || height <= 0) return null;

                        const startTimeStr = new Date(meeting.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        const endTimeStr = new Date(meeting.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <motion.div
                            key={meeting._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setActiveMeeting(meeting)}
                            className="absolute left-1.5 right-1.5 rounded-lg border bg-gradient-to-br from-violet-500 to-indigo-600 text-white p-2.5 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden group select-none ring-offset-background focus-within:ring-2 focus-within:ring-ring"
                            style={{
                              top: `${top + 4}px`,
                              height: `${height - 8}px`,
                            }}
                          >
                            <div className="min-w-0">
                              <h4 className="font-semibold text-xs leading-snug truncate">
                                {meeting.title}
                              </h4>
                              <p className="text-[10px] text-violet-100 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 shrink-0" />
                                {startTimeStr} - {endTimeStr}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleCancelClick(meeting, e)}
                              className="self-end p-1 rounded hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 text-white cursor-pointer shrink-0"
                              title="Cancel Meeting"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!activeMeeting && !isConfirmCancelOpen} onOpenChange={() => setActiveMeeting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
              <Info className="w-5 h-5" /> Meeting Details
            </DialogTitle>
            <DialogDescription>Overview of the scheduled meeting session.</DialogDescription>
          </DialogHeader>

          {activeMeeting && (
            <div className="space-y-4 py-2">
              <div className="border-b border-border pb-3">
                <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                  Title
                </span>
                <p className="text-base font-semibold mt-0.5">{activeMeeting.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-border pb-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                    Room Assigned
                  </span>
                  <p className="text-sm font-semibold mt-0.5 text-violet-600 dark:text-violet-400">
                    {activeMeeting.room.name}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                    Capacity limit
                  </span>
                  <p className="text-sm font-semibold mt-0.5">{activeMeeting.room.capacity} seats</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                  Duration Slot
                </span>
                <p className="text-sm mt-0.5 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-500" />
                  {new Date(activeMeeting.startTime).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}{' '}
                  -{' '}
                  {new Date(activeMeeting.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setActiveMeeting(null)}>
              Close
            </Button>
            {activeMeeting && (
              <Button
                variant="destructive"
                onClick={(e) => handleCancelClick(activeMeeting, e as any)}
                className="flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Cancel Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Cancel Dialog */}
      <Dialog open={isConfirmCancelOpen} onOpenChange={(open) => !open && setIsConfirmCancelOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">Cancel Meeting</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel "{activeMeeting?.title}"? This will immediately free up{' '}
              {activeMeeting?.room.name} for other bookings.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="destructive" onClick={handleConfirmCancel} className="w-full sm:w-auto">
              Yes, Cancel Meeting
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsConfirmCancelOpen(false)}
              className="w-full sm:w-auto"
            >
              Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
