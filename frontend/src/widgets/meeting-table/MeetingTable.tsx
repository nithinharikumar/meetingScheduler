import React, { useMemo, useState } from 'react';
import { useMeetings, useCancelMeeting } from '../../entities/meeting/hooks';
import { useUIStore } from '../../shared/hooks/useUIStore';
import type { Meeting } from '../../entities/meeting/types';
import { Card } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { Badge, getRoomBadgeVariant } from '../../shared/ui/badge';
import { DropdownMenu, DropdownItem } from '../../shared/ui/dropdown-menu';
import { TableSkeleton } from '../../shared/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../shared/ui/dialog';
import { EditMeetingForm } from '../../features/edit-meeting/EditMeetingForm';
import { MoreHorizontal, Trash2, ArrowUpDown, Clock, Building, Pencil, Users, Eye, AlertTriangle } from 'lucide-react';

export const MeetingTable: React.FC = () => {
  const selectedDate = useUIStore((state) => state.selectedDate);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);

  const { data: meetings = [], isLoading } = useMeetings({ date: selectedDate });
  const { mutateAsync: cancelMeeting, isPending: cancelPending } = useCancelMeeting({ date: selectedDate });

  const [sortField, setSortField] = useState<'title' | 'room' | 'time'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Meeting | null>(null);

  const itemsPerPage = 6;

  // Toggle sorting field and order
  const handleSort = (field: 'title' | 'room' | 'time') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort meetings list
  const processedMeetings = useMemo(() => {
    const activeConfirmed = meetings.filter((m) => m.status === 'CONFIRMED');
    
    // Search filter
    const filtered = activeConfirmed.filter((m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'room') {
        comparison = a.room.name.localeCompare(b.room.name);
      } else if (sortField === 'time') {
        comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [meetings, searchQuery, sortField, sortOrder]);

  // Paginate list
  const totalPages = Math.ceil(processedMeetings.length / itemsPerPage);
  const paginatedMeetings = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedMeetings.slice(startIdx, startIdx + itemsPerPage);
  }, [processedMeetings, currentPage]);

  const handleCancelClick = (meeting: Meeting) => {
    setActiveMeeting(meeting);
    setIsCancelOpen(true);
  };

  const handleViewClick = (meeting: Meeting) => {
    setActiveMeeting(meeting);
    setIsDetailsOpen(true);
  };

  const handleEditClick = (meeting: Meeting) => {
    setEditTarget(meeting);
    setIsEditOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (activeMeeting) {
      await cancelMeeting(activeMeeting._id);
      setIsCancelOpen(false);
      setActiveMeeting(null);
    }
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Table Wrapper */}
      <Card className="border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background-secondary select-none text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-4">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                  >
                    Meeting Title <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="p-4">
                  <button
                    onClick={() => handleSort('room')}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                  >
                    Room Assigned <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="p-4">
                  <button
                    onClick={() => handleSort('time')}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                  >
                    Time Schedule <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {paginatedMeetings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground select-none">
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <AlertTriangle className="w-8 h-8 stroke-1 text-muted-foreground/60" />
                      <h4 className="font-bold text-foreground">No meetings found</h4>
                      <p className="text-[10px] text-muted-foreground/80 max-w-xs">
                        {searchQuery 
                          ? `No bookings match your query "${searchQuery}".` 
                          : 'Try selecting a different date or schedule a new meeting.'
                        }
                      </p>
                      {searchQuery && (
                        <Button 
                          onClick={() => setSearchQuery('')} 
                          variant="outline" 
                          className="mt-2 h-7.5 px-3 text-[10px]"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMeetings.map((meeting) => {
                  const badgeVariant = getRoomBadgeVariant(meeting.room.name);
                  const startTimeStr = new Date(meeting.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const endTimeStr = new Date(meeting.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <tr 
                      key={meeting._id} 
                      className="hover:bg-muted-foreground/5 dark:hover:bg-muted/15 transition-colors group"
                    >
                      <td className="py-5 px-4 font-bold text-foreground">{meeting.title}</td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={badgeVariant} className="px-2 py-0.5 border-0">
                            {meeting.room.name}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 font-semibold">
                            <Users className="w-3.5 h-3.5" /> {meeting.room.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4 font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {startTimeStr} - {endTimeStr}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <Badge variant="success" className="px-2 py-0.5 border-0 uppercase text-[9px] tracking-wider font-bold">
                          Confirmed
                        </Badge>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <DropdownMenu
                          trigger={
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-md cursor-pointer hover:bg-muted-foreground/10 text-muted-foreground"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          }
                        >
                          <DropdownItem onClick={() => handleViewClick(meeting)}>
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" /> View Details
                          </DropdownItem>
                          <DropdownItem onClick={() => handleEditClick(meeting)}>
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Edit Meeting
                          </DropdownItem>
                          <DropdownItem 
                            variant="destructive" 
                            onClick={() => handleCancelClick(meeting)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Cancel Reservation
                          </DropdownItem>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border bg-background-secondary flex items-center justify-between select-none">
            <span className="text-[10px] text-muted-foreground font-semibold">
              Page {currentPage} of {totalPages} ({processedMeetings.length} total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                className="h-8 text-xs font-semibold px-3 cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                className="h-8 text-xs font-semibold px-3 cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Info Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={(open) => !open && setIsDetailsOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold text-primary">
              <Building className="w-5 h-5" /> Reservation Details
            </DialogTitle>
            <DialogDescription>Information details of meeting.</DialogDescription>
          </DialogHeader>

          {activeMeeting && (
            <div className="space-y-4 py-2 text-xs">
              <div className="border-b border-border pb-3">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Title
                </span>
                <p className="text-sm font-bold mt-0.5 text-foreground">{activeMeeting.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-border pb-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Room Name
                  </span>
                  <p className="text-xs font-bold mt-0.5 text-primary">
                    {activeMeeting.room.name}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Seats Capacity
                  </span>
                  <p className="text-xs font-bold mt-0.5 text-foreground">{activeMeeting.room.capacity} seats</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Reservation Time Slot
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="h-9 text-xs font-semibold px-4">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={(open) => !open && setIsCancelOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 font-bold">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Cancel Reservation
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to cancel the booking for "{activeMeeting?.title}"? This action cannot be undone, and the room will immediately be open for other bookings.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              loading={cancelPending}
              className="w-full sm:w-auto h-9 text-xs font-semibold"
            >
              Cancel Reservation
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCancelOpen(false)}
              className="w-full sm:w-auto h-9 text-xs font-semibold"
            >
              Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold text-primary">
              <Pencil className="w-5 h-5" /> Edit Meeting
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update the meeting details below. Changes take effect immediately.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <EditMeetingForm
              meeting={editTarget}
              onSuccess={() => { setIsEditOpen(false); setEditTarget(null); }}
              onCancel={() => { setIsEditOpen(false); setEditTarget(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
