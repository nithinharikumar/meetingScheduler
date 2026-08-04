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
import { cn } from "../../shared/utils/cn";

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
      <Card className={cn('border', 'border-border', 'bg-card', 'overflow-hidden', 'shadow-sm')}>
        <div className="overflow-x-auto">
          <table className={cn('w-full', 'text-left', 'border-collapse')}>
            <thead>
              <tr className={cn('border-b', 'border-border', 'bg-background-secondary', 'select-none', 'text-[10px]', 'font-bold', 'uppercase', 'tracking-wider', 'text-muted-foreground')}>
                <th className="p-4">
                  <button
                    onClick={() => handleSort('title')}
                    className={cn('flex', 'items-center', 'gap-1.5', 'hover:text-foreground', 'transition-colors', 'cursor-pointer')}
                  >
                    Meeting Title <ArrowUpDown className={cn('w-3.5', 'h-3.5')} />
                  </button>
                </th>
                <th className="p-4">
                  <button
                    onClick={() => handleSort('room')}
                    className={cn('flex', 'items-center', 'gap-1.5', 'hover:text-foreground', 'transition-colors', 'cursor-pointer')}
                  >
                    Room Assigned <ArrowUpDown className={cn('w-3.5', 'h-3.5')} />
                  </button>
                </th>
                <th className="p-4">
                  <button
                    onClick={() => handleSort('time')}
                    className={cn('flex', 'items-center', 'gap-1.5', 'hover:text-foreground', 'transition-colors', 'cursor-pointer')}
                  >
                    Time Schedule <ArrowUpDown className={cn('w-3.5', 'h-3.5')} />
                  </button>
                </th>
                <th className="p-4">Status</th>
                <th className={cn('p-4', 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', 'divide-border/40', 'text-xs')}>
              {paginatedMeetings.length === 0 ? (
                <tr>
                  <td colSpan={5} className={cn('p-8', 'text-center', 'text-muted-foreground', 'select-none')}>
                    <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'space-y-2', 'py-4')}>
                      <AlertTriangle className={cn('w-8', 'h-8', 'stroke-1', 'text-muted-foreground/60')} />
                      <h4 className={cn('font-bold', 'text-foreground')}>No meetings found</h4>
                      <p className={cn('text-[10px]', 'text-muted-foreground/80', 'max-w-xs')}>
                        {searchQuery 
                          ? `No bookings match your query "${searchQuery}".` 
                          : 'Try selecting a different date or schedule a new meeting.'
                        }
                      </p>
                      {searchQuery && (
                        <Button 
                          onClick={() => setSearchQuery('')} 
                          variant="outline" 
                          className={cn('mt-2', 'h-7.5', 'px-3', 'text-[10px]')}
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
                      className={cn('hover:bg-muted-foreground/5', 'dark:hover:bg-muted/15', 'transition-colors', 'group')}
                    >
                      <td className={cn('py-8', 'px-4', 'font-bold', 'text-foreground')}>{meeting.title}</td>
                      <td className={cn('py-9', 'px-4')}>
                        <div className={cn('flex', 'items-center', 'gap-2')}>
                          <Badge variant={badgeVariant} className={cn('px-2', 'py-0.5', 'border-0')}>
                            {meeting.room.name}
                          </Badge>
                          <span className={cn('text-[10px]', 'text-muted-foreground', 'flex', 'items-center', 'gap-0.5', 'font-semibold')}>
                            <Users className={cn('w-3.5', 'h-3.5')} /> {meeting.room.capacity}
                          </span>
                        </div>
                      </td>
                      <td className={cn('py-8', 'px-4', 'font-semibold', 'text-muted-foreground')}>
                        <span className={cn('flex', 'items-center', 'gap-1.5')}>
                          <Clock className={cn('w-3.5', 'h-3.5', 'text-primary')} />
                          {startTimeStr} - {endTimeStr}
                        </span>
                      </td>
                      <td className={cn('py-8', 'px-4')}>
                        <Badge variant="success" className={cn('px-2', 'py-0.5', 'border-0', 'uppercase', 'text-[9px]', 'tracking-wider', 'font-bold')}>
                          Confirmed
                        </Badge>
                      </td>
                      <td className={cn('py-8', 'px-4', 'text-right')}>
                        <DropdownMenu
                          trigger={
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn('h-7', 'w-7', 'rounded-md', 'cursor-pointer', 'hover:bg-muted-foreground/10', 'text-muted-foreground')}
                            >
                              <MoreHorizontal className={cn('w-4', 'h-4')} />
                            </Button>
                          }
                        >
                          <DropdownItem onClick={() => handleViewClick(meeting)}>
                            <Eye className={cn('w-3.5', 'h-3.5', 'text-muted-foreground')} /> View Details
                          </DropdownItem>
                          <DropdownItem onClick={() => handleEditClick(meeting)}>
                            <Pencil className={cn('w-3.5', 'h-3.5', 'text-muted-foreground')} /> Edit Meeting
                          </DropdownItem>
                          <DropdownItem 
                            variant="destructive" 
                            onClick={() => handleCancelClick(meeting)}
                          >
                            <Trash2 className={cn('w-3.5', 'h-3.5')} /> Cancel Reservation
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
          <div className={cn('p-4', 'border-t', 'border-border', 'bg-background-secondary', 'flex', 'items-center', 'justify-between', 'select-none')}>
            <span className={cn('text-[10px]', 'text-muted-foreground', 'font-semibold')}>
              Page {currentPage} of {totalPages} ({processedMeetings.length} total)
            </span>
            <div className={cn('flex', 'gap-2')}>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                className={cn('h-8', 'text-xs', 'font-semibold', 'px-3', 'cursor-pointer')}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                className={cn('h-8', 'text-xs', 'font-semibold', 'px-3', 'cursor-pointer')}
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
            <DialogTitle className={cn('flex', 'items-center', 'gap-2', 'font-bold', 'text-primary')}>
              <Building className={cn('w-5', 'h-5')} /> Reservation Details
            </DialogTitle>
            <DialogDescription>Information details of meeting.</DialogDescription>
          </DialogHeader>

          {activeMeeting && (
            <div className={cn('space-y-4', 'py-2', 'text-xs')}>
              <div className={cn('border-b', 'border-border', 'pb-3')}>
                <span className={cn('text-[10px]', 'text-muted-foreground', 'uppercase', 'font-bold', 'tracking-wider')}>
                  Title
                </span>
                <p className={cn('text-sm', 'font-bold', 'mt-0.5', 'text-foreground')}>{activeMeeting.title}</p>
              </div>

              <div className={cn('grid', 'grid-cols-2', 'gap-4', 'border-b', 'border-border', 'pb-3')}>
                <div>
                  <span className={cn('text-[10px]', 'text-muted-foreground', 'uppercase', 'font-bold', 'tracking-wider')}>
                    Room Name
                  </span>
                  <p className={cn('text-xs', 'font-bold', 'mt-0.5', 'text-primary')}>
                    {activeMeeting.room.name}
                  </p>
                </div>
                <div>
                  <span className={cn('text-[10px]', 'text-muted-foreground', 'uppercase', 'font-bold', 'tracking-wider')}>
                    Seats Capacity
                  </span>
                  <p className={cn('text-xs', 'font-bold', 'mt-0.5', 'text-foreground')}>{activeMeeting.room.capacity} seats</p>
                </div>
              </div>

              <div>
                <span className={cn('text-[10px]', 'text-muted-foreground', 'uppercase', 'font-bold', 'tracking-wider')}>
                  Reservation Time Slot
                </span>
                <p className={cn('text-xs', 'mt-0.5', 'font-bold', 'flex', 'items-center', 'gap-2', 'text-foreground')}>
                  <Clock className={cn('w-4', 'h-4', 'text-primary')} />
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
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className={cn('h-9', 'text-xs', 'font-semibold', 'px-4')}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={(open) => !open && setIsCancelOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className={cn('text-destructive', 'flex', 'items-center', 'gap-2', 'font-bold')}>
              <AlertTriangle className={cn('w-5', 'h-5', 'text-destructive')} /> Cancel Reservation
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to cancel the booking for "{activeMeeting?.title}"? This action cannot be undone, and the room will immediately be open for other bookings.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className={cn('gap-2', 'sm:justify-start')}>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              loading={cancelPending}
              className={cn('w-full', 'sm:w-auto', 'h-9', 'text-xs', 'font-semibold')}
            >
              Cancel Reservation
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCancelOpen(false)}
              className={cn('w-full', 'sm:w-auto', 'h-9', 'text-xs', 'font-semibold')}
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
            <DialogTitle className={cn('flex', 'items-center', 'gap-2', 'font-bold', 'text-primary')}>
              <Pencil className={cn('w-5', 'h-5')} /> Edit Meeting
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
