import 'expo-dev-client';

import ConfigInitializer from '@/lib/components/ConfigInitializer';
import { ServicesProvider } from '@/lib/components/ServicesProvider';
import { useConfig } from '@/lib/stores/config';
import { createSupabase } from '@/lib/supabase';
import { useThemedStyleSheet } from '@/lib/theme';
import { Stack } from 'expo-router';
import { SystemBars } from 'react-native-edge-to-edge';

export default function RootLayout() {
  const colorScheme = useConfig((a) => a.colorScheme);
  const styles = useStyles();

  return (
    <ServicesProvider supabase={supabase}>
      <ConfigInitializer />
      <SystemBars style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: true,
          headerLargeTitleStyle: styles.headerLargeTitle,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'JustDrop' }} />
      </Stack>
    </ServicesProvider>
  );
}

if (process.env.EXPO_PUBLIC_SUPABASE_URL == null) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
}

if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY == null) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createSupabase(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const useStyles = () => {
  return useThemedStyleSheet((theme) => {
    return {
      header: {
        backgroundColor: theme.colors.base,
      },
      headerTitle: {
        color: theme.colors.base_fg,
        fontWeight: '700',
      },
      headerLargeTitle: {
        color: theme.colors.base_fg,
        fontSize: theme.fontSize.h1,
        fontWeight: '700',
      },
    };
  }, []);
};
