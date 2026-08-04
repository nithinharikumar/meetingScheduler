import React from 'react';
import { useUIStore } from '../../shared/hooks/useUIStore';
import { useSidebarStore } from '../../shared/stores/sidebarStore';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Search, Plus, Sun, Moon, Laptop, Bell, Menu, LayoutDashboard, CalendarDays } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, setTheme, searchQuery, setSearchQuery, setCreateDialogOpen, activeTab, setActiveTab } = useUIStore();
  const { toggleMobileMenu } = useSidebarStore();

  return (
    <header className="border-b border-border bg-background/70 backdrop-blur-md sticky top-0 z-30 py-4 px-6 flex items-center justify-between gap-4 h-[73px]">
      {/* Left Section: Mobile Menu Trigger + Logo + Brand Name */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Hamburguer Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground cursor-pointer shrink-0"
          title="Open filters"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Brand logo & name */}
        <div className="flex items-center gap-2">
          <img
            src="/SyncSpace.png"
            alt="SyncSpace Logo"
            className="w-8 h-8 rounded-lg object-contain shrink-0 shadow-md shadow-primary/20"
          />
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm leading-none tracking-tight text-foreground">SyncSpace</h1>
            <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
              SaaS Scheduler
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Navigation Links (Dashboard & Meetings) */}
      <div className="flex items-center bg-muted/50 dark:bg-muted/30 border border-border/80 rounded-lg p-0.75 shadow-sm">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 ${
            activeTab === 'dashboard'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 ${
            activeTab === 'meetings'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Meetings
        </button>
      </div>

      {/* Right Section: Search + Theme + Notify + Profile + Book Meeting */}
      <div className="flex items-center gap-3">
        {/* Keyword Search Input */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-2.5 top-[50%] translate-y-[-50%] w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings..."
            className="pl-8 w-[180px] h-8.5 text-xs bg-muted/20 dark:bg-muted/10 border-border/70 placeholder:text-muted-foreground/60 focus-visible:ring-primary/40 focus-visible:border-primary"
          />
          <kbd className="absolute right-2 top-[50%] translate-y-[-50%] pointer-events-none select-none rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground/80 shadow-xs">
            /
          </kbd>
        </div>

        {/* Theme Switcher */}
        <div className="flex items-center bg-muted/65 dark:bg-muted/30 rounded-lg p-0.75 border border-border/80">
          <button
            onClick={() => setTheme('light')}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              theme === 'light' ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              theme === 'dark' ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              theme === 'system' ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="System Theme"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted hover:text-foreground text-muted-foreground cursor-pointer transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></span>
        </button>

        {/* User Profile Avatar */}
        <div
          className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-primary to-accent p-[1px] cursor-pointer shadow-sm shadow-primary/10 shrink-0"
          title="User Profile"
        >
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-xs font-bold text-foreground">
            NH
          </div>
        </div>

        {/* Book Meeting Button */}
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="h-8.5 px-3 py-1.5 text-xs font-semibold gap-1.5 shadow-md shadow-primary/10 rounded-lg hover:translate-y-[-1px] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Book
        </Button>
      </div>
    </header>
  );
};
