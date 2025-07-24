import { DependencyList, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useApp } from './stores/app';

export type Theme = typeof themeBase & {
  colors: Record<keyof typeof theme.light.colors, string>;
};

const themeBase = {
  fontSize: {
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    h5: 16,
    h6: 14,
    p: 16,
    small: 14,
  },
};

const theme = {
  light: {
    colors: {
      base: 'hsl(30 0% 96%)',
      base_2: 'hsl(30 0% 90%)',
      base_fg: 'hsl(30 0% 0%)',
      base_border: 'hsl(30 0% 88%)',
      primary: 'hsl(208 100% 50%)',
      primary_fg: 'hsl(208 100% 100%)',
    },
  },
  dark: {
    colors: {
      base: 'hsl(30 0% 4%)',
      base_2: 'hsl(30 0% 10%)',
      base_fg: 'hsl(30 0% 100%)',
      base_border: 'hsl(30 0% 20%)',
      primary: 'hsl(208 100% 50%)',
      primary_fg: 'hsl(208 100% 0%)',
    },
  },
} as const;

export const useTheme = () => {
  const colorScheme = useApp((a) => a.colorScheme);
  return useMemo(
    () => ({
      ...themeBase,
      ...(colorScheme === 'dark' ? theme.dark : theme.light),
    }),
    [colorScheme]
  );
};

export const useThemedStyleSheet = <
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>
>(
  create: (theme: Theme) => T & StyleSheet.NamedStyles<any>,
  dependencies: DependencyList
) => {
  const theme = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const wrappedCreate = useCallback(create, [theme, ...dependencies]);
  return useMemo(
    () => StyleSheet.create(wrappedCreate(theme)),
    [wrappedCreate, theme]
  );
};
