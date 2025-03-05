
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Settings store for API keys and preferences
export type SettingsState = {
  perplexityApiKey: string | null;
  serpApiKey: string | null;
  darkMode: boolean;
  setPerplexityApiKey: (key: string) => void;
  setSerpApiKey: (key: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      perplexityApiKey: null,
      serpApiKey: null,
      darkMode: false, // Default to light mode
      setPerplexityApiKey: (key: string) => set({ perplexityApiKey: key }),
      setSerpApiKey: (key: string) => set({ serpApiKey: key }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (enabled: boolean) => set({ darkMode: enabled }),
    }),
    {
      name: 'settings',
    }
  )
);
