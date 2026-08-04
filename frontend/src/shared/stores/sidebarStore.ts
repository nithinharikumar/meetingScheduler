import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  collapsed: boolean;
  mobileMenu: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setMobileMenu: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileMenu: false,
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setMobileMenu: (mobileMenu) => set({ mobileMenu }),
      toggleMobileMenu: () => set((state) => ({ mobileMenu: !state.mobileMenu })),
    }),
    {
      name: 'syncspace-sidebar-store',
      partialize: (state) => ({ collapsed: state.collapsed }),
    }
  )
);
