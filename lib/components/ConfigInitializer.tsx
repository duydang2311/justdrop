import { useApp } from '@/lib/stores/app';
import { useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
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
    console.log('systemColorScheme:', systemColorScheme);
  }, [systemColorScheme]);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('Color scheme changed:', colorScheme);
    });
    return () => {
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (preferredColorScheme === 'system') {
      setColorScheme(systemColorScheme ?? 'light');
      Appearance.setColorScheme(null);
    } else {
      setColorScheme(preferredColorScheme);
      Appearance.setColorScheme(preferredColorScheme);
    }
  }, [preferredColorScheme, setColorScheme, systemColorScheme]);

  return null;
}
