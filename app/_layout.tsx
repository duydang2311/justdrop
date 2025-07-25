import ConfigInitializer from '@/lib/components/ConfigInitializer';
import { ServicesProvider } from '@/lib/components/ServicesProvider';
import { useApp } from '@/lib/stores/app';
import { useServices } from '@/lib/stores/services';
import { createSupabase } from '@/lib/supabase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

export default function RootLayout() {
  const [sessionInitialized, setSessionInitialized] = useState(false);

  return (
    <ServicesProvider supabase={supabase}>
      <ConfigInitializer />
      <SessionInitializer onInitialized={() => setSessionInitialized(true)} />
      {sessionInitialized && (
        <QueryClientProvider client={queryClient}>
          <Slot />
        </QueryClientProvider>
      )}
    </ServicesProvider>
  );
}

function SessionInitializer({ onInitialized }: { onInitialized: () => void }) {
  const supabase = useServices((a) => a.supabase);
  const setSession = useApp((a) => a.setSession);
  const initializedRef = useRef(false);

  useEffect(() => {
    // supabase.auth.signOut();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        onInitialized();
      }
      console.log('Auth state changed:', _e, session);
      setSession(session);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [onInitialized, supabase, setSession]);
  return <></>;
}

const supabase = createSupabase(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

const queryClient = new QueryClient();
