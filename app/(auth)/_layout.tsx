import { useApp } from '@/lib/stores/app';
import { useThemedStyleSheet } from '@/lib/theme';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  const colorScheme = useApp((a) => a.colorScheme);
  const styles = useStyles();
  const session = useApp((a) => a.session);

  if (session == null) {
    return <Redirect href="/(guest)/captcha" />;
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerLargeTitle: false,
          headerLargeTitleShadowVisible: true,
          headerLargeTitleStyle: styles.headerLargeTitle,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'JustDrop' }} />
      </Stack>
    </>
  );
}

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
