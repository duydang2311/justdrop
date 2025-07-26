import { SafeAreaView, View, type ViewProps } from 'react-native';
import { useThemedStyleSheet } from '../theme';

export default function ThemedScreenView({ style, ...props }: ViewProps) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, style]} {...props} />
    </SafeAreaView>
  );
}

const useStyles = () => {
  return useThemedStyleSheet((theme) => {
    return {
      container: {
        flex: 1,
        backgroundColor: theme.resolve(
          theme.colors.base,
          theme.colors.base_dark
        ),
      },
      content: {
        paddingBlock: 16,
        paddingInline: 8,
      },
    };
  }, []);
};
