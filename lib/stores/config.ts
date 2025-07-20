import { create } from 'zustand';

interface Config {
  readonly colorScheme: 'light' | 'dark';
  readonly preferredColorScheme: 'light' | 'dark' | 'system';
  setColorScheme(colorScheme: 'light' | 'dark'): void;
  setPreferredColorScheme(colorScheme: 'light' | 'dark' | 'system'): void;
}

export const useConfig = create<Config>((set) => ({
  colorScheme: 'light',
  preferredColorScheme: 'system',
  setColorScheme: (colorScheme: 'light' | 'dark') => set({ colorScheme }),
  setPreferredColorScheme: (
    preferredColorScheme: 'light' | 'dark' | 'system'
  ) => set({ preferredColorScheme }),
}));
