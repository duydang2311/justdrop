import { SupabaseClient } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';

export interface Services {
  readonly supabase: SupabaseClient;
}

export const ServicesContext = createContext<ServicesStore | null>(null);

export type ServicesStore = ReturnType<typeof createServicesStore>;

export const createServicesStore = (services: Services) => {
  return createStore<Services>(() => services);
};

export const useServicesContext = () => {
  return useContext(ServicesContext);
};

export const useServices = <T>(selector: (state: Services) => T) => {
  const context = useServicesContext();
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return useStore(context, selector);
};
