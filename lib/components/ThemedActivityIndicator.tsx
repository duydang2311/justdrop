import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';
import { useTheme } from '../theme';

export default function ThemedActivityIndicator({
  style,
  color,
  ...props
}: ActivityIndicatorProps) {
  const theme = useTheme();
  return (
    <ActivityIndicator color={color ?? theme.colors.base_fg_muted} {...props} />
  );
}
