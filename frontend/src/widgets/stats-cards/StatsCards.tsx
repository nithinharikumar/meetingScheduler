import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useMeetingStats } from '../../entities/meeting/hooks';
import { Card, CardContent } from '../../shared/ui/card';
import { CalendarRange, Activity, Flame, Clock } from 'lucide-react';

interface StatsCardsProps {
  selectedDate: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ selectedDate }) => {
  const { data: stats, isLoading, error } = useMeetingStats(selectedDate);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, idx) => (
          <Card key={idx} className="border border-border/80 bg-card/60 backdrop-blur-md h-24 animate-pulse">
            <CardContent className="h-full flex items-center justify-between p-6">
              <div className="space-y-2 flex-1">
                <div className="h-3.5 w-24 bg-muted rounded"></div>
                <div className="h-6 w-16 bg-muted rounded"></div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const items = [
    {
      title: "Today's Bookings",
      value: stats.totalMeetingsToday,
      subtitle: "Confirmed meetings",
      icon: CalendarRange,
      color: "from-violet-500/10 to-purple-500/10 text-violet-500 border-violet-500/20",
      iconColor: "text-violet-500 dark:text-violet-400 bg-violet-500/10",
    },
    {
      title: "Room Occupancy",
      value: `${stats.occupancyRateToday}%`,
      subtitle: "Of working hours (8AM-10PM)",
      icon: Activity,
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-500 border-emerald-500/20",
      iconColor: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      title: "Most Popular Room",
      value: stats.mostUsedRoom,
      subtitle: "All-time bookings leader",
      icon: Flame,
      color: "from-pink-500/10 to-rose-500/10 text-pink-500 border-pink-500/20",
      iconColor: "text-pink-500 dark:text-pink-400 bg-pink-500/10",
    },
    {
      title: "Avg Meeting Duration",
      value: `${stats.averageDuration}m`,
      subtitle: "Across all rooms",
      icon: Clock,
      color: "from-blue-500/10 to-cyan-500/10 text-blue-500 border-blue-500/20",
      iconColor: "text-blue-500 dark:text-blue-400 bg-blue-500/10",
    },
  ];

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
          <motion.div key={idx} variants={itemVariants}>
            <Card className="overflow-hidden border border-border/80 bg-card/45 backdrop-blur-sm hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.title}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {item.value}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 font-medium">
                    {item.subtitle}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl border border-border/50 transition-transform duration-300 group-hover:scale-110 ${item.iconColor}`}>
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
