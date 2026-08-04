import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Header } from '../widgets/header/Header';
import { SchedulerGrid } from '../widgets/meeting-list/SchedulerGrid';
import { StatsCards } from '../widgets/stats-cards/StatsCards';
import { useUIStore } from '../shared/hooks/useUIStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../shared/ui/dialog';
import { CreateMeetingForm } from '../features/create-meeting/CreateMeetingForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const { theme, isCreateDialogOpen, setCreateDialogOpen, selectedDate } = useUIStore();

  // Initialize theme on mount
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
        {/* Global Toasts notifier */}
        <Toaster richColors position="bottom-right" />

        {/* Dashboard Header */}
        <Header />

        {/* Main Workspace Timeline Container */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Timeline Scheduler</h2>
              <p className="text-sm text-muted-foreground">
                Assign meetings to rooms dynamically. Synchronize your team schedules.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-lg border border-border/80">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              Real-time synchronization active
            </div>
          </div>

          <StatsCards selectedDate={selectedDate} />

          <SchedulerGrid />
        </main>

        {/* Global Booking Form Dialog Modal */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-violet-600 dark:text-violet-400">Book a Meeting Room</DialogTitle>
              <DialogDescription>
                Submit details below. The scheduling algorithm will automatically assign the first available room.
              </DialogDescription>
            </DialogHeader>

            <CreateMeetingForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </QueryClientProvider>
  );
};

export default App;
