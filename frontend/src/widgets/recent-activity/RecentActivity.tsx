import React from 'react';
import { useMeetings } from '../../entities/meeting/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/card';
import { Clock, Calendar, Check, AlertCircle } from 'lucide-react';

interface RecentActivityProps {
  selectedDate: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ selectedDate }) => {
  const { data: meetings = [], isLoading } = useMeetings({ date: selectedDate });

  // Get active meetings sorted by createdAt descending
  const recentBookings = React.useMemo(() => {
    return [...meetings]
      .filter((m) => m.status === 'CONFIRMED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [meetings]);

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="border border-border bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0"></div>
                <div className="space-y-1.5 flex-1 pt-1.5">
                  <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-2 w-20 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 stroke-1.5 mb-2 text-muted-foreground/60" />
            <p className="text-xs font-semibold">No recent bookings</p>
            <p className="text-[10px] text-muted-foreground/70">Meetings booked today will appear here</p>
          </div>
        ) : (
          <div className="relative border-l border-border/80 pl-4 ml-2.5 space-y-5 py-1">
            {recentBookings.map((meeting) => {
              const startStr = new Date(meeting.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div key={meeting._id} className="relative group">
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card shadow-sm group-hover:scale-110 transition-transform"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {meeting.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                      <span>Room: <strong className="text-foreground/80">{meeting.room.name}</strong></span>
                      <span>•</span>
                      <span>Starts at: <strong className="text-foreground/80">{startStr}</strong></span>
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 mt-1 font-semibold">
                      {formatRelativeTime(meeting.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
