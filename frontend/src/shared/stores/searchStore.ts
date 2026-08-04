import { create } from 'zustand';

export interface SearchFilters {
  date: string;
  roomId: string | null;
  status: 'ALL' | 'CONFIRMED' | 'CANCELLED';
}

export interface SortConfig {
  key: 'title' | 'startTime' | 'endTime' | 'room' | 'createdAt';
  direction: 'asc' | 'desc';
}

interface SearchState {
  search: string;
  filters: SearchFilters;
  sorting: SortConfig;
  
  setSearch: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setSorting: (sorting: Partial<SortConfig>) => void;
}

const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialFilters: SearchFilters = {
  date: getTodayString(),
  roomId: null,
  status: 'ALL',
};

const initialSorting: SortConfig = {
  key: 'startTime',
  direction: 'asc',
};

export const useSearchStore = create<SearchState>((set) => ({
  search: '',
  filters: initialFilters,
  sorting: initialSorting,

  setSearch: (search) => set({ search }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: { ...initialFilters, date: getTodayString() } }),
  setSorting: (newSorting) =>
    set((state) => ({
      sorting: { ...state.sorting, ...newSorting },
    })),
}));
