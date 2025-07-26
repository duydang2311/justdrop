import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useThemedStyleSheet } from '../theme';

type ButtonVariant = 'base' | 'primary';

interface Props extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  textStyle?: StyleProp<TextStyle>;
}

export default function ThemedButton({
  title,
  style,
  variant = 'base',
  textStyle,
  ...props
}: Props) {
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  const variantStyles = useVariantStyles(variant);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={(state) => [
          styles.button,
          variantStyles.button,
          typeof style === 'function' ? style(state) : style,
        ]}
        onPressIn={() => {
          opacity.value = withTiming(0.6, { duration: 150 });
        }}
        onPressOut={() => {
          opacity.value = withTiming(1, { duration: 150 });
        }}
        {...props}
      >
        <Text style={[styles.text, variantStyles.text, textStyle]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    padding: 8,
  },
  text: {
    textAlign: 'center',
  },
});

const useVariantStyles = (variant: ButtonVariant) => {
  return useThemedStyleSheet(
    (theme) => {
      switch (variant) {
        case 'primary':
          return {
            button: {
              backgroundColor: theme.colors.primary,
            },
            text: {
              color: theme.colors.primary_fg,
            },
          };
        default:
          return {
            button: {
              backgroundColor: theme.resolve(theme.colors.base_dark, theme.colors.base_light),
            },
            text: {
              color: theme.colors.base_fg,
            },
          };
      }
    },
    [variant]
  );
};
