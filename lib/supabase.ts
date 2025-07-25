import 'react-native-url-polyfill/auto';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from './supabase-types';

export type AppSupabase = SupabaseClient<Database>;

export const createSupabase = (url: string, anonKey: string) => {
  return createClient<Database>(url, anonKey, {
    auth: {
      storage: {
        isServer: false,
        getItem(key) {
          return SecureStore.getItemAsync(key);
        },
        setItem(key, value) {
          return SecureStore.setItemAsync(key, value);
        },
        removeItem(key) {
          return SecureStore.deleteItemAsync(key);
        },
      },
    },
  });
};
