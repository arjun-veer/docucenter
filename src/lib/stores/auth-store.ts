
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '../types';

// Auth store for user authentication state
type AuthState = {
  isAuthenticated: boolean;
  currentUser: {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
    verified?: boolean;
  } | null;
  login: (user: { id: string; email: string; role: UserRole; name?: string; verified?: boolean }) => void;
  updateUserRole: (role: UserRole) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      login: (user) => set({ 
        isAuthenticated: true, 
        currentUser: {
          ...user,
          verified: user.verified !== undefined ? user.verified : true
        } 
      }),
      updateUserRole: (role) => set((state) => ({
        currentUser: state.currentUser 
          ? { ...state.currentUser, role }
          : null
      })),
      logout: () => set({ isAuthenticated: false, currentUser: null }),
    }),
    {
      name: 'auth',
    }
  )
);
