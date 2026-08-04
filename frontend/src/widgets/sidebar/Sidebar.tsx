import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarStore } from '../../shared/stores/sidebarStore';
import { useUIStore } from '../../shared/hooks/useUIStore';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutDashboard,
  CalendarDays,
  Settings,
  DoorOpen,
  Presentation,
  Coffee,
  Zap,
  Leaf,
  Flame,
  Star,
  Hexagon,
  BookOpen,
  Globe,
} from 'lucide-react';
import { Badge, getRoomBadgeVariant } from '../../shared/ui/badge';
import { useRooms as useRoomsHook } from '../../entities/meeting/hooks';

// Deterministic icon assignment per room — cycles through a palette of icons
const ROOM_ICONS = [DoorOpen, Presentation, Coffee, Zap, Leaf, Flame, Star, Hexagon, BookOpen, Globe];
const ROOM_COLORS = [
  'text-purple-500',
  'text-blue-500',
  'text-emerald-500',
  'text-amber-500',
  'text-pink-500',
  'text-red-500',
  'text-cyan-500',
  'text-indigo-500',
  'text-lime-500',
  'text-orange-500',
];
const ROOM_BG = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-lime-500',
  'bg-orange-500',
];

const getRoomIcon = (index: number) => ROOM_ICONS[index % ROOM_ICONS.length];
const getRoomColor = (index: number) => ROOM_COLORS[index % ROOM_COLORS.length];
const getRoomDotColor = (index: number) => ROOM_BG[index % ROOM_BG.length];

export const Sidebar: React.FC = () => {
  const { collapsed, toggleCollapsed, mobileMenu, setMobileMenu } = useSidebarStore();
  const { selectedDate, setSelectedDate, selectedRoomId, setSelectedRoomId, activeTab, setActiveTab } = useUIStore();
  const { data: rooms = [] } = useRoomsHook();

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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings List', icon: CalendarDays },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-background-secondary border-r border-border select-none">
      {/* Navigation section */}
      <div className="p-4 space-y-1">
        {!collapsed && (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-3 mb-2">
            Navigation
          </span>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setMobileMenu(false);
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      <hr className="border-t border-border/60 mx-4" />

      {/* Date Navigation Section */}
      <div className="p-4 space-y-3">
        {!collapsed && (
          <div className="flex items-center justify-between px-3">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Schedule Date
            </span>
            <button
              onClick={handleToday}
              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
            >
              TODAY
            </button>
          </div>
        )}
        <div className={`flex ${collapsed ? 'flex-col gap-2' : 'items-center gap-1'} bg-card p-1.5 rounded-lg border border-border shadow-sm`}>
          <button
            onClick={handlePrevDay}
            className="flex-1 py-1 text-xs rounded font-medium text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground cursor-pointer transition-colors"
            title="Previous Day"
          >
            ‹
          </button>
          {!collapsed && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-center border-0 outline-none p-0 w-28 text-foreground cursor-pointer focus:ring-0"
            />
          )}
          {collapsed && (
            <div className="flex items-center justify-center p-1 text-muted-foreground" title={selectedDate}>
              <Calendar className="w-3.5 h-3.5" />
            </div>
          )}
          <button
            onClick={handleNextDay}
            className="flex-1 py-1 text-xs rounded font-medium text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground cursor-pointer transition-colors"
            title="Next Day"
          >
            ›
          </button>
        </div>
      </div>

      <hr className="border-t border-border/60 mx-4" />

      {/* Room Filters Section */}
      <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-3 mb-2">
            Rooms Filter
          </span>
        )}

        {/* All Rooms option */}
        <button
          onClick={() => setSelectedRoomId(null)}
          title={collapsed ? 'All Rooms' : undefined}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer ${
            selectedRoomId === null
              ? 'bg-card text-foreground border border-border/80 shadow-sm'
              : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${selectedRoomId === null ? 'bg-primary' : 'bg-muted-foreground/45'}`}></span>
            {!collapsed && <span>All Rooms</span>}
          </div>
          {!collapsed && <span className="text-[10px] text-muted-foreground">({rooms.length})</span>}
        </button>

        {rooms.map((room, index) => {
          const isSelected = selectedRoomId === room._id;
          const badgeVariant = getRoomBadgeVariant(room.name);
          const RoomIcon = getRoomIcon(index);
          const iconColor = getRoomColor(index);
          const dotColor = getRoomDotColor(index);
          return (
            <button
              key={room._id}
              onClick={() => setSelectedRoomId(room._id)}
              title={collapsed ? `${room.name} (${room.capacity} seats)` : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-card text-foreground border border-border/80 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <RoomIcon className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
                {!collapsed && <span className="truncate">{room.name}</span>}
              </div>
              {!collapsed && (
                <Badge variant={badgeVariant} className="px-1 text-[9px] scale-90 border-0 shrink-0">
                  {room.capacity}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <hr className="border-t border-border/60 mx-4" />

      {/* Settings Button */}
      <div className="p-4 space-y-1">
        <button
          onClick={() => {
            setActiveTab('settings');
            setMobileMenu(false);
          }}
          title={collapsed ? 'Settings' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
              : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-4 border-t border-border/60">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center gap-2 text-xs font-semibold"><ChevronLeft className="w-4 h-4" /> Collapse</div>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on md and up) */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:block shrink-0 sticky top-[73px] h-[calc(100vh-73px)] z-10 overflow-hidden"
      >
        <div className="w-full h-full">
          {sidebarContent}
        </div>
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenu(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />
            {/* Slide-in side drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-72 h-full shadow-2xl"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setMobileMenu(false)}
                  className="absolute top-4 right-4 z-50 p-1.5 rounded-lg bg-card border border-border hover:bg-muted text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="h-full">
                  <SidebarContentMobile />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Mobile sidebar (never collapsed) ───────────────────────────────────────
const SidebarContentMobile: React.FC = () => {
  const { setMobileMenu } = useSidebarStore();
  const { selectedDate, setSelectedDate, selectedRoomId, setSelectedRoomId, activeTab, setActiveTab } = useUIStore();
  const { data: rooms = [] } = useRoomsHook();

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
    <div className="flex flex-col h-full bg-background-secondary border-r border-border select-none">
      <div className="p-6">
        <h2 className="font-bold text-base text-foreground">SyncSpace Filters</h2>
        <p className="text-xs text-muted-foreground">Adjust display settings</p>
      </div>

      <hr className="border-t border-border/60 mx-4" />

      {/* Navigation */}
      <div className="p-4 space-y-1">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-3 mb-2">
          Navigation
        </span>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'meetings', label: 'Meetings List', icon: CalendarDays },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setMobileMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <hr className="border-t border-border/60 mx-4" />

      {/* Date Navigation Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between px-3">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Schedule Date
          </span>
          <button
            onClick={handleToday}
            className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
          >
            TODAY
          </button>
        </div>
        <div className="flex items-center gap-1 bg-card p-1.5 rounded-lg border border-border shadow-sm">
          <button
            onClick={handlePrevDay}
            className="flex-1 py-1 text-xs rounded font-medium text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground cursor-pointer transition-colors"
          >
            ‹
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-semibold text-center border-0 outline-none p-0 w-28 text-foreground cursor-pointer focus:ring-0"
          />
          <button
            onClick={handleNextDay}
            className="flex-1 py-1 text-xs rounded font-medium text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground cursor-pointer transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <hr className="border-t border-border/60 mx-4" />

      {/* Room Filters Section */}
      <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-3 mb-2">
          Rooms Filter
        </span>
        <button
          onClick={() => { setSelectedRoomId(null); setMobileMenu(false); }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer ${
            selectedRoomId === null
              ? 'bg-card text-foreground border border-border/80 shadow-sm'
              : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${selectedRoomId === null ? 'bg-primary' : 'bg-muted-foreground/45'}`}></span>
            <span>All Rooms</span>
          </div>
          <span className="text-[10px] text-muted-foreground">({rooms.length})</span>
        </button>

        {rooms.map((room, index) => {
          const isSelected = selectedRoomId === room._id;
          const badgeVariant = getRoomBadgeVariant(room.name);
          const RoomIcon = getRoomIcon(index);
          const iconColor = getRoomColor(index);
          return (
            <button
              key={room._id}
              onClick={() => { setSelectedRoomId(room._id); setMobileMenu(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-card text-foreground border border-border/80 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <RoomIcon className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
                <span className="truncate">{room.name}</span>
              </div>
              <Badge variant={badgeVariant} className="px-1 text-[9px] scale-90 border-0 shrink-0">
                {room.capacity}
              </Badge>
            </button>
          );
        })}
      </div>

      <hr className="border-t border-border/60 mx-4" />

      {/* Settings */}
      <div className="p-4">
        <button
          onClick={() => { setActiveTab('settings'); setMobileMenu(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
              : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
