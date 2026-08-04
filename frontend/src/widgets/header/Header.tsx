import React from 'react';
import { useUIStore } from '../../shared/hooks/useUIStore';
import { useRooms } from '../../entities/meeting/hooks';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Calendar, Search, Plus, Sun, Moon, Laptop, Filter } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, setTheme, selectedDate, setSelectedDate, searchQuery, setSearchQuery, selectedRoomId, setSelectedRoomId, setCreateDialogOpen } = useUIStore();
  const { data: rooms = [] } = useRooms();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <header className="border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-20 py-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Brand logo & theme switch */}
      <div className="flex items-center justify-between md:justify-start gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-violet-500/20">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">SyncSpace</h1>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Meeting Room Scheduler
            </span>
          </div>
        </div>

        {/* Theme Toggler Buttons */}
        <div className="flex items-center bg-secondary rounded-lg p-1 border border-border">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              theme === 'light' ? 'bg-card text-violet-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              theme === 'dark' ? 'bg-card text-violet-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              theme === 'system' ? 'bg-card text-violet-600 dark:text-violet-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="System Theme"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Search & Room Filter & Date navigation */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Selector Navigation */}
        <div className="flex items-center bg-secondary rounded-lg p-1 border border-border">
          <button
            onClick={handlePrevDay}
            className="px-2.5 py-1 text-sm rounded-md font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ‹
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs rounded-md font-medium bg-card shadow-sm text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={handleNextDay}
            className="px-2.5 py-1 text-sm rounded-md font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ›
          </button>
          <div className="flex items-center gap-1.5 pl-3 pr-2 border-l border-border/85 ml-1 select-none">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-semibold border-0 outline-none focus:ring-0 p-0 text-foreground cursor-pointer"
            />
          </div>
        </div>

        {/* Room Filter Dropdown */}
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 border border-border">
          <Filter className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
          <select
            value={selectedRoomId || ''}
            onChange={(e) => setSelectedRoomId(e.target.value || null)}
            className="bg-transparent text-sm font-medium border-0 outline-none p-1 text-foreground cursor-pointer"
          >
            <option value="">All Rooms</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

        {/* Keyword Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-[50%] translate-y-[-50%] w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings..."
            className="pl-8 w-full sm:w-[200px] h-9"
          />
        </div>

        {/* Action Button: Book Meeting */}
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-1.5 shadow-md shadow-violet-500/10">
          <Plus className="w-4 h-4" /> Book Meeting
        </Button>
      </div>
    </header>
  );
};
