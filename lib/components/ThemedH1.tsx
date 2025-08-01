import { Text, TextProps } from 'react-native';
import { useThemedStyleSheet } from '../theme';

type Props = TextProps;

export default function ThemedH1({ style, ...props }: Props) {
  const styles = useThemedStyleSheet((theme) => {
    return {
      text: {
        fontSize: theme.fontSize.h1,
        color: theme.colors.base_fg,
        fontWeight: 700
      },
    };
  }, []);

  return (
    <Text
      style={[styles.text, style]}
      accessibilityRole="header"
      aria-level={1}
      {...props}
    />
  );
}
