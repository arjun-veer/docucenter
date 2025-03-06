
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
        try {
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
            
            console.log('Fetched user profile:', userData);
            
            // Ensure role is a valid UserRole
            const role = userData?.role as UserRole || 'user';
            
            set({ 
              isAuthenticated: true, 
              currentUser: {
                id: user.id,
                email: user.email || '',
                role: role,
                name: user.user_metadata?.name || user.user_metadata?.full_name,
                verified: user.email_confirmed_at ? true : false
              } 
            });
            
            console.log('User authenticated with role:', role);
          }
        } catch (error) {
          console.error('Error initializing from Supabase:', error);
        }
      }
    }),
    {
      name: 'auth',
    }
  )
);
