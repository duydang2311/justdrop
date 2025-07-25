import { Text, TextProps } from 'react-native';
import { useThemedStyleSheet } from '../theme';

type Props = TextProps;

export default function ThemedH2({ style, ...props }: Props) {
  const styles = useThemedStyleSheet((theme) => {
    return {
      text: {
        fontSize: theme.fontSize.h2,
        color: theme.resolve(
          theme.colors.base_fg_dark,
          theme.colors.base_fg_light
        ),
        fontWeight: 700,
      },
    };
  }, []);

  return (
    <Text
      style={[styles.text, style]}
      accessibilityRole="header"
      aria-level={2}
      {...props}
    />
  );
}
