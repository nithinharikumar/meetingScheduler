import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  bookingConfirmations: boolean;
  cancellationAlerts: boolean;
  remindersEnabled: boolean;
  reminderMinutesBefore: number;
}

interface NotificationState {
  preferences: NotificationPreferences;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: NotificationPreferences = {
  email: true,
  push: false,
  bookingConfirmations: true,
  cancellationAlerts: true,
  remindersEnabled: true,
  reminderMinutesBefore: 15,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),
      resetPreferences: () => set({ preferences: defaultPreferences }),
    }),
    {
      name: 'syncspace-notification-store',
    }
  )
);
