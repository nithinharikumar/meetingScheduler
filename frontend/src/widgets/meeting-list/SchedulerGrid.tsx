import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeetings, useRooms, useCancelMeeting } from '../../entities/meeting/hooks';
import { useUIStore } from '../../shared/hooks/useUIStore';
import type { Meeting } from '../../entities/meeting/types';
import { Button } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Trash2, Users, Clock, Info, AlertTriangle, CalendarPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../shared/ui/dialog';
import { TimelineSkeleton } from '../../shared/ui/skeleton';
import { getRoomBadgeVariant } from '../../shared/ui/badge';

const START_HOUR = 8; // 8:00 AM
const END_HOUR = 22; // 10:00 PM
const HOUR_HEIGHT = 72; // height in pixels of 1 hour block

export const SchedulerGrid: React.FC = () => {
  const selectedDate = useUIStore((state) => state.selectedDate);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const selectedRoomId = useUIStore((state) => state.selectedRoomId);
  const setCreateDialogOpen = useUIStore((state) => state.setCreateDialogOpen);

  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: meetings = [], isLoading: meetingsLoading } = useMeetings({ date: selectedDate });
  const { mutateAsync: cancelMeeting, isPending: cancelPending } = useCancelMeeting({ date: selectedDate });

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

  const getRoomGradient = (roomName: string) => {
    const variant = getRoomBadgeVariant(roomName);
    switch (variant) {
      case 'room1':
        return 'from-purple-500 to-indigo-600 hover:shadow-purple-500/20 text-white border-purple-400/20';
      case 'room2':
        return 'from-blue-500 to-indigo-600 hover:shadow-blue-500/20 text-white border-blue-400/20';
      case 'room3':
        return 'from-emerald-500 to-teal-600 hover:shadow-emerald-500/20 text-white border-emerald-400/20';
      case 'room4':
        return 'from-amber-500 to-orange-600 hover:shadow-amber-500/20 text-white border-amber-400/20';
      case 'room5':
        return 'from-pink-500 to-rose-600 hover:shadow-pink-500/20 text-white border-pink-400/20';
      default:
        return 'from-primary to-secondary hover:shadow-primary/20 text-white border-primary/20';
    }
  };

  const getMeetingCoordinates = (meeting: Meeting) => {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);

    const startH = start.getHours();
    const startM = start.getMinutes();
    const endH = end.getHours();
    const endM = end.getMinutes();

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

  const hasVisibleRooms = rooms.length > 0;
  const numRooms = rooms.length;

  if (roomsLoading || meetingsLoading) {
    return <TimelineSkeleton />;
  }

  // Empty state rendering
  if (meetings.filter(m => m.status === 'CONFIRMED').length === 0) {
    return (
      <Card className="border border-border bg-card shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-bounce">
          <CalendarPlus className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-foreground">No meetings scheduled</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">
          There are no bookings confirmed for {new Date(selectedDate).toLocaleDateString([], { dateStyle: 'long' })} yet. Get started by booking a room!
        </p>
        <Button onClick={() => setCreateDialogOpen(true)} className="px-5 font-semibold text-xs h-9">
          Book First Meeting
        </Button>
      </Card>
    );
  }

  if (filteredMeetings.length === 0) {
    return (
      <Card className="border border-border bg-card shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-foreground">No search results found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">
          Your search query "{searchQuery}" did not return any meetings matching the filter criteria.
        </p>
        <Button onClick={() => setSearchQuery('')} variant="outline" className="px-5 font-semibold text-xs h-9">
          Clear Search Filter
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-border shadow-sm bg-card transition-all duration-300">
      <div className="overflow-x-auto min-w-full">
        {/* Scheduler Header row */}
        <div 
          className="grid border-b border-border sticky top-0 bg-card/90 backdrop-blur-xs z-10 min-w-[900px]"
          style={{ gridTemplateColumns: `80px repeat(${numRooms}, 1fr)` }}
        >
          <div className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center select-none">
            Time
          </div>
          {rooms.map((room) => {
            const isDimmed = selectedRoomId && selectedRoomId !== room._id;
            return (
              <div
                key={room._id}
                className={`p-4 border-l border-border flex flex-col justify-center transition-opacity duration-200 ${
                  isDimmed ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span className="font-bold text-xs text-foreground tracking-tight">{room.name}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1 font-semibold">
                  <Users className="w-3 h-3 text-muted-foreground/80" /> Cap: {room.capacity}
                </span>
              </div>
            );
          })}
        </div>

        {/* Timeline Grid Content */}
        <div
          className="grid relative min-w-[900px]"
          style={{ 
            height: `${hours.length * HOUR_HEIGHT}px`,
            gridTemplateColumns: `80px repeat(${numRooms}, 1fr)`
          }}
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
                  className="flex items-start justify-center text-[10px] text-muted-foreground/85 font-semibold pt-1.5 select-none"
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
              className="absolute top-0 bottom-0 border-l border-border/30 pointer-events-none"
              style={{ left: `calc(80px + ${idx} * (100% - 80px) / ${numRooms})` }}
            ></div>
          ))}

          {/* Absolute positioned scheduled meetings */}
          <div className="absolute inset-0 left-[80px] pointer-events-none">
            <div className="relative w-full h-full">
              {rooms.map((room, roomIdx) => {
                const roomMeetings = meetingsByRoom[room._id] || [];
                const roomWidthPercentage = 100 / numRooms;
                const roomLeftOffset = roomIdx * roomWidthPercentage;
                const isDimmed = selectedRoomId && selectedRoomId !== room._id;

                if (isDimmed) return null;

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
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setActiveMeeting(meeting)}
                            className={`absolute left-1.5 right-1.5 rounded-lg border bg-gradient-to-br ${getRoomGradient(room.name)} p-2 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md cursor-pointer group select-none transition-all duration-200 hover:scale-[1.01]`}
                            style={{
                              top: `${top + 4}px`,
                              height: `${height - 8}px`,
                            }}
                          >
                            <div className="min-w-0">
                              <h4 className="font-bold text-[11px] leading-snug truncate">
                                {meeting.title}
                              </h4>
                              <p className="text-[9px] text-white/95 flex items-center gap-1 mt-0.5 font-medium">
                                <Clock className="w-2.5 h-2.5 shrink-0 text-white/80" />
                                {startTimeStr} - {endTimeStr}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleCancelClick(meeting, e)}
                              className="self-end p-0.75 rounded-md hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 text-white cursor-pointer shrink-0"
                              title="Cancel Meeting"
                            >
                              <Trash2 className="w-3 h-3" />
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary font-bold">
              <Info className="w-5 h-5" /> Meeting Details
            </DialogTitle>
            <DialogDescription>Detailed view of the reservation session.</DialogDescription>
          </DialogHeader>

          {activeMeeting && (
            <div className="space-y-4 py-2 text-xs">
              <div className="border-b border-border/80 pb-3">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Title
                </span>
                <p className="text-sm font-bold mt-0.5 text-foreground">{activeMeeting.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-border/80 pb-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Room Assigned
                  </span>
                  <p className="text-xs font-bold mt-0.5 text-primary">
                    {activeMeeting.room.name}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Capacity limit
                  </span>
                  <p className="text-xs font-bold mt-0.5 text-foreground">{activeMeeting.room.capacity} seats</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Duration Slot
                </span>
                <p className="text-xs mt-0.5 font-bold flex items-center gap-2 text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
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
            <Button variant="outline" onClick={() => setActiveMeeting(null)} className="h-9 text-xs font-semibold">
              Close
            </Button>
            {activeMeeting && (
              <Button
                variant="destructive"
                onClick={(e) => handleCancelClick(activeMeeting, e as any)}
                className="flex items-center gap-1.5 h-9 text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Cancel Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Cancel Dialog */}
      <Dialog open={isConfirmCancelOpen} onOpenChange={(open) => !open && setIsConfirmCancelOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 font-bold">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Cancel Meeting
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to cancel "{activeMeeting?.title}"? This will immediately free up{' '}
              {activeMeeting?.room.name} for other bookings.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              loading={cancelPending}
              className="w-full sm:w-auto h-9 text-xs font-semibold"
            >
              Yes, Cancel Meeting
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsConfirmCancelOpen(false)}
              className="w-full sm:w-auto h-9 text-xs font-semibold"
            >
              Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
