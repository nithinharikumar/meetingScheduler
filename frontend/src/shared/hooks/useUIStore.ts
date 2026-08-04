import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type ActiveTab = 'dashboard' | 'meetings' | 'settings' | 'user-settings';

export interface UIState {
  theme: Theme;
  selectedDate: string; // YYYY-MM-DD
  searchQuery: string;
  isCreateDialogOpen: boolean;
  selectedRoomId: string | null;
  activeTab: ActiveTab;
  businessStartHour: number;
  businessEndHour: number;
  
  setTheme: (theme: Theme) => void;
  setSelectedDate: (date: string) => void;
  setSearchQuery: (query: string) => void;
  setCreateDialogOpen: (open: boolean) => void;
  setSelectedRoomId: (roomId: string | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setBusinessHours: (start: number, end: number) => void;
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('theme') as Theme | null;
  return saved || 'system';
};

const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getInitialBusinessStartHour = (): number => {
  const saved = localStorage.getItem('businessStartHour');
  return saved ? parseInt(saved, 10) : 8;
};

const getInitialBusinessEndHour = (): number => {
  const saved = localStorage.getItem('businessEndHour');
  return saved ? parseInt(saved, 10) : 21;
};

export const useUIStore = create<UIState>((set) => ({
  theme: getInitialTheme(),
  selectedDate: getTodayString(),
  searchQuery: '',
  isCreateDialogOpen: false,
  selectedRoomId: null,
  activeTab: 'dashboard',
  businessStartHour: getInitialBusinessStartHour(),
  businessEndHour: getInitialBusinessEndHour(),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
    
    // Apply class to HTML element
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  },
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCreateDialogOpen: (isCreateDialogOpen) => set({ isCreateDialogOpen }),
  setSelectedRoomId: (selectedRoomId) => set({ selectedRoomId }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setBusinessHours: (start, end) => {
    localStorage.setItem('businessStartHour', start.toString());
    localStorage.setItem('businessEndHour', end.toString());
    set({ businessStartHour: start, businessEndHour: end });
  },
}));
