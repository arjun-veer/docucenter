
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth store for user authentication state
type AuthState = {
  isAuthenticated: boolean;
  currentUser: {
    id: string;
    email: string;
    role: string;
    name?: string;
    verified?: boolean;
  } | null;
  login: (user: { id: string; email: string; role: string; name?: string }) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      login: (user) => set({ isAuthenticated: true, currentUser: {...user, verified: true} }),
      logout: () => set({ isAuthenticated: false, currentUser: null }),
    }),
    {
      name: 'auth',
    }
  )
);
