import { Text, TextProps } from 'react-native';
import { useThemedStyleSheet } from '../theme';

type Props = TextProps;

export default function ThemedText({ style, ...props }: Props) {
  const styles = useThemedStyleSheet((theme) => {
    return {
      text: {
        color: theme.colors.base_fg,
      },
    };
  }, []);
  return <Text style={[styles.text, style]} {...props} />;
}
