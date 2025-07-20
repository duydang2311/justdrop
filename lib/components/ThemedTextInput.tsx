import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Colors } from '../constants/Colors';
import { useConfig } from '../stores/config';

type Props = TextInputProps;

export default function ThemedTextInput({ style, ...props }: Props) {
  const colorScheme = useConfig((a) => a.colorScheme);
  return (
    <TextInput
      style={[
        styles.input,
        colorScheme === 'dark' ? styles.inputDark : styles.inputLight,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
  },
  inputLight: {
    color: Colors.light.base_fg,
    borderColor: Colors.light.base_border,
  },
  inputDark: {
    color: Colors.dark.base_fg,
    borderColor: Colors.dark.base_border,
  },
});
