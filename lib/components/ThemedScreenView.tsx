import { SafeAreaView, ScrollView, View, type ViewProps } from 'react-native';
import { useThemedStyleSheet } from '../theme';

interface Props extends ViewProps {
  scroll?: boolean;
}

export default function ThemedScreenView({ style, scroll, ...props }: Props) {
  const styles = useStyles();
  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={[styles.content, style]} {...props} />
    </ScrollView>
  ) : (
    <View style={[styles.content, style]} {...props} />
  );
  return <SafeAreaView style={styles.container}>{content}</SafeAreaView>;
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
