import { create } from 'zustand';
import { UserRole } from '@/core/types/user';

interface OnboardingState {
  pendingRole: UserRole | null;
  setPendingRole: (role: UserRole | null) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  pendingRole: null,
  setPendingRole: (role) => set({ pendingRole: role }),
}));


