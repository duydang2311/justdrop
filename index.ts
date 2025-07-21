import 'expo-dev-client';

if (process.env.EXPO_PUBLIC_SUPABASE_URL == null) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
}

if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY == null) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

// eslint-disable-next-line import/first
import 'expo-router/entry';
