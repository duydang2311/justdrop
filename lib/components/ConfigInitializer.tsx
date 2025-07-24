import { useApp } from '@/lib/stores/app';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useShallow } from 'zustand/shallow';

export default function ConfigInitializer() {
  const systemColorScheme = useColorScheme();
  const { preferredColorScheme, setColorScheme } = useApp(
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
