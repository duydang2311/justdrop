import { type DependencyList, useCallback, useMemo } from 'react';
import { type ColorValue, StyleSheet } from 'react-native';
import { useApp } from './stores/app';

export type Theme = typeof themeBase & {
  readonly isDark: boolean;
  readonly isLight: boolean;
  colors: Record<keyof typeof theme.light.colors, string>;
  resolve<T extends ColorValue>(color: T): T;
  resolve<A extends ColorValue, B extends ColorValue>(light: A, dark: B): A | B;
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
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

const theme = {
  light: {
    colors: {
      base_light: 'hsl(30 0% 100%)',
      base: 'hsl(30 0% 96%)',
      base_dark: 'hsl(30 0% 90%)',
      base_fg: 'hsl(30 0% 10%)',
      base_fg_light: 'hsl(30 0% 30%)',
      base_fg_dark: 'hsl(30 0% 0%)',
      base_fg_muted: 'hsl(30 0% 60%)',
      base_border: 'hsl(30 0% 88%)',
      primary: 'hsl(208 100% 50%)',
      primary_fg: 'hsl(208 100% 100%)',
    },
  },
  dark: {
    colors: {
      base_light: 'hsl(30 0% 8%)',
      base: 'hsl(30 0% 4%)',
      base_dark: 'hsl(30 0% 0%)',
      base_fg: 'hsl(30 0% 90%)',
      base_fg_light: 'hsl(30 0% 100%)',
      base_fg_dark: 'hsl(30 0% 70%)',
      base_fg_muted: 'hsl(30 0% 30%)',
      base_border: 'hsl(30 0% 20%)',
      primary: 'hsl(208 100% 50%)',
      primary_fg: 'hsl(208 100% 0%)',
    },
  },
} as const;

export const useTheme = () => {
  const colorScheme = useApp((a) => a.colorScheme);
  return useMemo<Theme>(
    () => ({
      ...themeBase,
      ...(colorScheme === 'dark' ? theme.dark : theme.light),
      get isDark() {
        return colorScheme === 'dark';
      },
      get isLight() {
        return colorScheme === 'light';
      },
      resolve(lightOrDark: unknown, dark?: unknown) {
        return dark == null ? lightOrDark : this.isLight ? lightOrDark : dark;
      },
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
