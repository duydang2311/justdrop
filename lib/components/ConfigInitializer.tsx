import { useConfig } from '@/lib/stores/config';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useShallow } from 'zustand/shallow';

export default function ConfigInitializer() {
  const systemColorScheme = useColorScheme();
  const { preferredColorScheme, setColorScheme } = useConfig(
    useShallow(({ preferredColorScheme, setColorScheme }) => ({
      preferredColorScheme,
      setColorScheme,
    }))
  );

  useEffect(() => {
    if (preferredColorScheme === 'system') {
      setColorScheme(systemColorScheme ?? 'light');
    } else {
      setColorScheme(preferredColorScheme);
    }
  }, [preferredColorScheme, setColorScheme, systemColorScheme]);

  return null;
}
