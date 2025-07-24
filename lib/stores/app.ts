import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

interface App {
  readonly colorScheme: 'light' | 'dark';
  readonly preferredColorScheme: 'light' | 'dark' | 'system';
  readonly session: Session | null;
  setColorScheme(colorScheme: 'light' | 'dark'): void;
  setPreferredColorScheme(colorScheme: 'light' | 'dark' | 'system'): void;
  setSession(session: Session | null): void;
}

export const useApp = create<App>((set) => ({
  colorScheme: 'light',
  preferredColorScheme: 'system',
  session: null,
  setColorScheme: (colorScheme: 'light' | 'dark') => set({ colorScheme }),
  setPreferredColorScheme: (
    preferredColorScheme: 'light' | 'dark' | 'system'
  ) => set({ preferredColorScheme }),
  setSession: (session: Session | null) => set({ session }),
}));
