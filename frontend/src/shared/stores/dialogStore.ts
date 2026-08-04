import { create } from 'zustand';

export interface ConfirmationDialogConfig {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  confirmText?: string;
  cancelText?: string;
}

interface DialogState {
  isCreateDialogOpen: boolean;
  selectedMeeting: any | null;
  confirmationDialog: ConfirmationDialogConfig;
  
  setCreateDialogOpen: (open: boolean) => void;
  setSelectedMeeting: (meeting: any | null) => void;
  openConfirmationDialog: (config: Omit<ConfirmationDialogConfig, 'isOpen'>) => void;
  closeConfirmationDialog: () => void;
}

const initialConfirmation: ConfirmationDialogConfig = {
  isOpen: false,
  title: '',
  description: '',
  onConfirm: () => {},
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

export const useDialogStore = create<DialogState>((set) => ({
  isCreateDialogOpen: false,
  selectedMeeting: null,
  confirmationDialog: initialConfirmation,

  setCreateDialogOpen: (open) => set({ isCreateDialogOpen: open }),
  setSelectedMeeting: (meeting) => set({ selectedMeeting: meeting }),
  openConfirmationDialog: (config) =>
    set({
      confirmationDialog: {
        ...initialConfirmation,
        ...config,
        isOpen: true,
      },
    }),
  closeConfirmationDialog: () =>
    set((state) => ({
      confirmationDialog: {
        ...state.confirmationDialog,
        isOpen: false,
      },
    })),
}));
