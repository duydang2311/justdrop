import { useApp } from '@/lib/stores/app';
import { useTheme, useThemedStyleSheet } from '@/lib/theme';
import { HeaderBackButton } from '@react-navigation/elements';
import { Redirect, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  const colorScheme = useApp((a) => a.colorScheme);
  const styles = useStyles();
  const session = useApp((a) => a.session);
  const router = useRouter();
  const theme = useTheme();

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
          headerTintColor: theme.colors.primary,
          headerLargeTitle: false,
          headerLargeTitleShadowVisible: true,
          headerLargeTitleStyle: styles.headerLargeTitle,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen
          name="transfers/[id]/index"
          options={{ title: 'Transfer Details' }}
        />
        <Stack.Screen
          name="transfers/[id]/receive/index"
          options={{
            title: 'Download Files',
            headerLeft: (props) =>
              props.canGoBack ? undefined : (
                <HeaderBackButton
                  label="Home"
                  labelStyle={styles.headerLeftLabel}
                  tintColor={theme.colors.primary}
                  onPress={() => {
                    router.replace('/');
                  }}
                />
              ),
          }}
        />
      </Stack>
    </>
  );
}

const useStyles = () => {
  return useThemedStyleSheet((theme) => {
    return {
      header: {
        backgroundColor: theme.resolve(
          theme.colors.base_light,
          theme.colors.base
        ),
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
      headerLeftLabel: {
        color: theme.colors.primary,
      }
    };
  }, []);
};
