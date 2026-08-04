import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMeetingStats, useMeetings, useRooms } from '../../entities/meeting/hooks';
import { Card, CardContent } from '../../shared/ui/card';
import { CalendarRange, CheckCircle2, Layers, Activity } from 'lucide-react';
import { StatsSkeleton } from '../../shared/ui/skeleton';

interface StatsCardsProps {
  selectedDate: string;
}

// Simple Count-up utility component with animation frame cleanup
const AnimatedCounter: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 500, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value]);

  return <span>{displayValue}{suffix}</span>;
};

export const StatsCards: React.FC<StatsCardsProps> = ({ selectedDate }) => {
  const { data: stats, isLoading: statsLoading } = useMeetingStats(selectedDate);
  const { data: meetings = [], isLoading: meetingsLoading } = useMeetings({ date: selectedDate });
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();

  const isLoading = statsLoading || meetingsLoading || roomsLoading;

  if (isLoading) {
    return <StatsSkeleton />;
  }

  // Calculate occupied and available rooms correctly
  const activeMeetings = meetings.filter(m => m.status === 'CONFIRMED');
  const validRoomIds = new Set(rooms.map(r => r._id));
  
  const occupiedRoomIds = new Set(
    activeMeetings
      .map(m => typeof m.room === 'string' ? m.room : m.room?._id)
      .filter(id => id && validRoomIds.has(id))
  );
  
  const occupiedRoomsCount = occupiedRoomIds.size;
  const availableRoomsCount = Math.max(0, rooms.length - occupiedRoomsCount);
  const totalMeetingsToday = activeMeetings.length;

  const items = [
    {
      title: "Today's Meetings",
      value: totalMeetingsToday,
      suffix: "",
      subtitle: "Confirmed bookings",
      icon: CalendarRange,
      colorClass: "text-purple-500 bg-purple-500/10 dark:bg-purple-950/20 border-purple-500/20",
    },
    {
      title: "Available Rooms",
      value: availableRoomsCount,
      suffix: "",
      subtitle: "Rooms with no bookings today",
      icon: CheckCircle2,
      colorClass: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/20",
    },
    {
      title: "Occupied Rooms",
      value: occupiedRoomsCount,
      suffix: "",
      subtitle: "Rooms currently in use today",
      icon: Layers,
      colorClass: "text-amber-500 bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/20",
    },
    {
      title: "Room Occupancy Rate",
      value: stats?.occupancyRateToday || 0,
      suffix: "%",
      subtitle: "Of working hours (8AM-10PM)",
      icon: Activity,
      colorClass: "text-blue-500 bg-blue-500/10 dark:bg-blue-950/20 border-blue-500/20",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div key={idx} variants={cardVariants}>
            <Card className="relative overflow-hidden border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {item.title}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                      <AnimatedCounter value={item.value} suffix={item.suffix} />
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 font-medium">
                    {item.subtitle}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl border border-transparent transition-all duration-300 group-hover:scale-110 ${item.colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
