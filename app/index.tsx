import ThemedButton from '@/lib/components/ThemedButton';
import ThemedH2 from '@/lib/components/ThemedH2';
import ThemedText from '@/lib/components/ThemedText';
import { useThemedStyleSheet } from '@/lib/theme';
import { getDocumentAsync } from 'expo-document-picker';
import { File } from 'expo-file-system/next';
import { SafeAreaView, ScrollView } from 'react-native';

export default function Index() {
  const styles = useStyles();

  const handlePress = async () => {
    const result = await getDocumentAsync({
      copyToCacheDirectory: false,
      multiple: true,
    });

    if (result.canceled) {
      return;
    }

    for (const asset of result.assets) {
      console.log('Asset URI: ', asset.uri);
    }

    const files = result.assets.map((a) => new File(a.uri));
    for (const file of files) {
      console.log('File URI: ', file.uri);
      console.log('File Name: ', file.name);
      console.log('File Type: ', file.type);
    }
  };

  return (
    <ScrollView
      style={[styles.scrollView]}
      contentContainerStyle={styles.scrollViewContentContainer}
    >
      <SafeAreaView style={[styles.safeAreaView]}>
        <ThemedH2>Transfer files</ThemedH2>
        <ThemedText>Direct file sharing between devices</ThemedText>
        <ThemedButton
          title="Choose files"
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={handlePress}
        />
      </SafeAreaView>
    </ScrollView>
  );
}

const useStyles = () => {
  return useThemedStyleSheet((theme) => {
    return {
      scrollView: {
        backgroundColor: theme.colors.base,
      },
      scrollViewContentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      safeAreaView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      button: {
        marginBlockStart: 16,
      },
      buttonText: {
        textTransform: 'capitalize',
      },
    };
  }, []);
};
