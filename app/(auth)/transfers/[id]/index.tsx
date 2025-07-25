import ThemedH2 from '@/lib/components/ThemedH2';
import ThemedText from '@/lib/components/ThemedText';
import { useTransferQuery } from '@/lib/queries';
import { Database } from '@/lib/supabase-types';
import { useThemedStyleSheet } from '@/lib/theme';
import BottomSheet, {
    BottomSheetFlatList,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import invariant from 'tiny-invariant';

export default function Index() {
  const styles = useStyles();
  const { id } = useLocalSearchParams();
  invariant(id, 'id must not be null');
  invariant(typeof id === 'string', 'id must be a string');

  const { isPending, error, data } = useTransferQuery(id);
  if (isPending) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText>Error: {error.message}</ThemedText>
      </SafeAreaView>
    );
  }

  if (data == null) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText>Transfer not found</ThemedText>
      </SafeAreaView>
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
      <SafeAreaView style={styles.container}>
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
        <FileListBottomSheet assets={transfer.assets} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

function FileListBottomSheet({
  assets,
}: {
  assets: Database['public']['Tables']['transfers']['Row']['assets'];
}) {
  const styles = useBottomSheetStyles();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['20%', '50%', '80%'], []);
  const safeAssets = useMemo(
    () => (assets as { name: string; size: number; mimeType?: string }[]) ?? [],
    [assets]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      enableDynamicSizing={false}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
      snapPoints={snapPoints}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ThemedH2>File List</ThemedH2>
        <ThemedText style={styles.helpText}>
          {safeAssets.length} files •{' '}
          {formatSize(
            safeAssets.reduce((total, asset) => total + asset.size, 0)
          )}
        </ThemedText>
        <BottomSheetFlatList
          style={styles.list}
          data={safeAssets}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          renderItem={({ item }) => (
            <View>
              <ThemedText>{item.name}</ThemedText>
              <ThemedText style={styles.listItemBottomText}>
                {formatSize(item.size)} • {formatMimeType(item.mimeType)}
              </ThemedText>
            </View>
          )}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}

const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatMimeType = (mimeType?: string) => {
  if (!mimeType) return 'Unknown';
  const parts = mimeType.split('/');
  return parts.length > 1 ? parts[1].toUpperCase() : mimeType.toUpperCase();
};

const getScheme = () => {
  const scheme = Constants.expoConfig?.scheme;
  return Array.isArray(scheme) ? scheme[0] : scheme;
};

const useStyles = () => {
  return useThemedStyleSheet((theme) => {
    return {
      container: {
        backgroundColor: theme.colors.base,
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
        borderRadius: 8,
      },
    };
  }, []);
};

const useBottomSheetStyles = () => {
  return useThemedStyleSheet((theme) => {
    return {
      background: {
        backgroundColor: theme.colors.base_light,
        borderWidth: 1,
        borderColor: theme.colors.base_border,
        shadowRadius: 8,
        shadowColor: theme.colors.base_fg,
      },
      handleIndicator: {
        backgroundColor: theme.resolve(
          theme.colors.base_fg,
          theme.colors.base_fg_muted
        ),
      },
      contentContainer: {
        paddingBlock: 8,
        paddingInline: 16,
      },
      helpText: {
        marginBlockStart: 8,
        color: theme.resolve(
          theme.colors.base_fg_light,
          theme.colors.base_fg_dark
        ),
      },
      list: {
        marginTop: 16,
      },
      listItemBottomText: {
        marginTop: 4,
        color: theme.resolve(
          theme.colors.base_fg_light,
          theme.colors.base_fg_dark
        ),
      },
    };
  }, []);
};
