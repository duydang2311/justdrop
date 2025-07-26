import { SafeAreaView, ScrollView, View, type ViewProps } from 'react-native';
import { useThemedStyleSheet } from '../theme';

export default function ThemedScreenView({ style, ...props }: ViewProps) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={[styles.content, style]} {...props} />
      </ScrollView>
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
      scrollView: {
        flex: 1,
      },
      content: {
        paddingBlock: 16,
        paddingInline: 8,
      },
    };
  }, []);
};
