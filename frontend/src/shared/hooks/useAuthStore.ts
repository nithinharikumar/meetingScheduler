import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'SuperAdmin' | 'Admin' | 'Manager' | 'Employee';
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUserRole: (role: 'SuperAdmin' | 'Admin' | 'Manager' | 'Employee') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => {
        localStorage.setItem('auth_token', user.token);
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, isAuthenticated: false });
      },
      updateUserRole: (role) => set((state) => {
        if (!state.user) return state;
        return { user: { ...state.user, role } };
      }),
    }),
    {
      name: 'auth-storage', // key in local storage
    }
  )
);
