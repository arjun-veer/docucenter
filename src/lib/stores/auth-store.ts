
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '../types';
import { supabase } from '../supabase';

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
  initializeFromSupabase: () => Promise<void>;
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
          // Make sure the role is a valid UserRole
          role: user.role as UserRole,
          verified: user.verified !== undefined ? user.verified : true
        } 
      }),
      updateUserRole: (role) => set((state) => ({
        currentUser: state.currentUser 
          ? { ...state.currentUser, role }
          : null
      })),
      logout: async () => {
        // Sign out from Supabase when user logs out
        await supabase.auth.signOut();
        set({ isAuthenticated: false, currentUser: null });
      },
      initializeFromSupabase: async () => {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          const { user } = data.session;
          
          // Get user metadata from Supabase
          const { data: userData, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching user profile:', error);
          }
          
          set({ 
            isAuthenticated: true, 
            currentUser: {
              id: user.id,
              email: user.email || '',
              role: (userData?.role as UserRole) || 'user',
              name: user.user_metadata?.name || user.user_metadata?.full_name,
              verified: user.email_confirmed_at ? true : false
            } 
          });
        }
      }
    }),
    {
      name: 'auth',
    }
  )
);
