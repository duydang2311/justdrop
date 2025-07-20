import { TextInput, TextInputProps } from 'react-native';
import { useThemedStyleSheet } from '../theme';

type Props = TextInputProps;

export default function ThemedTextInput({ style, ...props }: Props) {
  const styles = useStyles();
  return <TextInput style={[styles.input, style]} {...props} />;
}

const useStyles = () => {
  return useThemedStyleSheet((theme) => {
    return {
      input: {
        padding: 8,
        borderWidth: 1,
        borderRadius: 5,
        color: theme.colors.base_fg,
        borderColor: theme.colors.base_border,
      },
    };
  }, []);
};
