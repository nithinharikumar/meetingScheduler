import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Header } from '../widgets/header/Header';
import { Sidebar } from '../widgets/sidebar/Sidebar';
import { SchedulerGrid } from '../widgets/meeting-list/SchedulerGrid';
import { StatsCards } from '../widgets/stats-cards/StatsCards';
import { MeetingTable } from '../widgets/meeting-table/MeetingTable';
import { RecentActivity } from '../widgets/recent-activity/RecentActivity';
import { CreateMeetingForm } from '../features/create-meeting/CreateMeetingForm';
import { useUIStore } from '../shared/hooks/useUIStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../shared/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/ui/card';
import { CalendarDays, LayoutDashboard } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const { theme, isCreateDialogOpen, setCreateDialogOpen, selectedDate, activeTab } = useUIStore();

  // Initialize theme on mount and when changed
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
        {/* Global Toast Notifier */}
        <Toaster richColors position="bottom-right" />

        {/* Top Navbar */}
        <Header />

        {/* Layout container */}
        <div className="flex flex-1 relative w-full overflow-hidden">
          {/* Collapsible Sidebar / Mobile Drawer */}
          <Sidebar />

          {/* Main workspace */}
          <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full">
            {/* Header title section */}
            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  {activeTab === 'dashboard' ? (
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                  ) : (
                    <CalendarDays className="w-5 h-5 text-primary" />
                  )}
                  {activeTab === 'dashboard' ? 'Timeline Scheduler' : 'Meetings Registry'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {activeTab === 'dashboard'
                    ? 'Assign meetings to rooms dynamically and monitor real-time schedules.'
                    : 'Search, filter, and organize all room bookings.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground bg-background-secondary border border-border/80 px-3 py-1.5 rounded-lg w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                Sync active
              </div>
            </div>

            {/* Statistics Row */}
            <StatsCards selectedDate={selectedDate} />

            {/* Tab Panels */}
            {activeTab === 'dashboard' ? (
              // Dashboard View
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeline Grid (Col Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                  <SchedulerGrid />
                </div>

                {/* Right Panel (Col Span 1): Form + Recent Activity */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  {/* Quick Schedule card */}
                  <Card className="border border-border bg-card shadow-sm">
                    <CardHeader className="p-5 pb-3">
                      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Quick Booking
                      </CardTitle>
                      <CardDescription className="text-[10px]">
                        The scheduler automatically assigns the first available room.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <CreateMeetingForm onSuccess={() => {}} />
                    </CardContent>
                  </Card>

                  {/* Recent Activity feed */}
                  <div className="flex-1">
                    <RecentActivity selectedDate={selectedDate} />
                  </div>
                </div>
              </div>
            ) : (
              // Meetings List View
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Meeting Table (Col Span 2) */}
                <div className="lg:col-span-2">
                  <MeetingTable />
                </div>

                {/* Side Quick Booking Panel (Col Span 1) */}
                <div className="lg:col-span-1">
                  <Card className="border border-border bg-card shadow-sm sticky top-[95px]">
                    <CardHeader className="p-5 pb-3">
                      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Book a Room
                      </CardTitle>
                      <CardDescription className="text-[10px]">
                        Choose dates and times below. Rooms are allocated automatically.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <CreateMeetingForm onSuccess={() => {}} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Global Booking Modal Dialog (Triggered from Topbar) */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary font-bold">Book a Meeting Room</DialogTitle>
              <DialogDescription className="text-xs">
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
