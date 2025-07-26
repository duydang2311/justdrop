import ThemedActivityIndicator from '@/lib/components/ThemedActivityIndicator';
import ThemedH2 from '@/lib/components/ThemedH2';
import ThemedScreenView from '@/lib/components/ThemedScreenView';
import ThemedText from '@/lib/components/ThemedText';
import TransferFileListBottomSheet from '@/lib/components/TransferFileListBottomSheet';
import { useTransferQuery } from '@/lib/queries';
import type { Database } from '@/lib/supabase-types';
import { useThemedStyleSheet } from '@/lib/theme';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import QRCode from 'react-native-qrcode-svg';
import invariant from 'tiny-invariant';

export default function Index() {
  const styles = useStyles();
  const { id } = useLocalSearchParams();
  invariant(id, 'id must not be null');
  invariant(typeof id === 'string', 'id must be a string');

  const { isPending, error, data } = useTransferQuery(id);
  if (isPending) {
    return (
      <ThemedScreenView style={styles.container}>
        <ThemedActivityIndicator size="large" />
      </ThemedScreenView>
    );
  }

  if (error) {
    return (
      <ThemedScreenView style={styles.container}>
        <ThemedText>Error: {error.message}</ThemedText>
      </ThemedScreenView>
    );
  }

  if (data == null) {
    return (
      <ThemedScreenView style={styles.container}>
        <ThemedText>Transfer not found</ThemedText>
      </ThemedScreenView>
    );
  }

  return <TransferDetailsView transfer={data} />;
}

function TransferDetailsView({
  transfer,
}: {
  transfer: Database['public']['Tables']['transfers']['Row'];
}) {
  const styles = useStyles();
  const scheme = getScheme();
  invariant(scheme, 'scheme must not be null');

  return (
    <GestureHandlerRootView>
      <ThemedScreenView style={styles.container}>
        <ThemedH2>Scan to Download</ThemedH2>
        <ThemedText style={styles.text}>
          Other devices can scan to receive files
        </ThemedText>
        <View style={styles.qrCode}>
          <QRCode
            value={`${scheme}://transfers/${transfer.id}/receive`}
            size={256}
          />
        </View>
      </ThemedScreenView>
      <TransferFileListBottomSheet assets={transfer.assets} />
    </GestureHandlerRootView>
  );
}

const getScheme = () => {
  const scheme = Constants.expoConfig?.scheme;
  return Array.isArray(scheme) ? scheme[0] : scheme;
};

const useStyles = () => {
  return useThemedStyleSheet((theme) => {
    return {
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      text: {
        marginTop: 4,
        textAlign: 'center',
      },
      qrCode: {
        marginTop: 24,
        backgroundColor: theme.colors.base_light,
        borderWidth: 1,
        borderColor: theme.colors.base_border,
        padding: 8,
        borderRadius: theme.radius.lg,
      },
    };
  }, []);
};
