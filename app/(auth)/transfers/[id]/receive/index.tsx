import ThemedButton from '@/lib/components/ThemedButton';
import ThemedScreenView from '@/lib/components/ThemedScreenView';
import ThemedText from '@/lib/components/ThemedText';
import TransferFileListBottomSheet from '@/lib/components/TransferFileListBottomSheet';
import { formatMimeType, formatSize } from '@/lib/formats';
import { useTransferQuery } from '@/lib/queries';
import type { Database } from '@/lib/supabase-types';
import { useThemedStyleSheet } from '@/lib/theme';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import invariant from 'tiny-invariant';

export default function Index() {
  const { id } = useLocalSearchParams();
  invariant(id, 'id must not be null');
  invariant(typeof id === 'string', 'id must be a string');

  const { isPending, error, data } = useTransferQuery(id);
  const styles = useStyles();

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

  return <ReceiveTransferView transfer={data} />;
}

function ReceiveTransferView({
  transfer,
}: {
  transfer: Database['public']['Tables']['transfers']['Row'];
}) {
  const styles = useReceiveTransferViewStyles();
  const stats = useMemo(
    () => [
      {
        label: 'Total Files',
        value: transfer.assets.length.toString(),
      },
      {
        label: 'Total Size',
        value: formatSize(
          transfer.assets.reduce((total, asset) => total + asset.size, 0)
        ),
      },
      {
        label: 'File Types',
        value: Array.from(
          new Set(transfer.assets.map((asset) => asset.mimeType)).values()
        )
          .map(formatMimeType)
          .join(', '),
      },
    ],
    [transfer.assets]
  );

  return (
    <GestureHandlerRootView>
      <ThemedScreenView style={styles.container}>
        <ThemedText style={styles.textMuted}>
          Only accept files from trusted sources. Scan files for malware before
          opening.
        </ThemedText>
        <FlatList
          data={stats}
          style={styles.statsTable}
          ItemSeparatorComponent={() => <View style={styles.statsSeparator} />}
          renderItem={({ item }) => (
            <View style={styles.statsItem}>
              <ThemedText>{item.label}</ThemedText>
              <ThemedText style={styles.statsItemValue} numberOfLines={1}>
                {item.value}
              </ThemedText>
            </View>
          )}
        />
        <ThemedButton
          variant="primary"
          style={styles.downloadFilesButton}
          title="Download Files"
          onPress={() => {
            // TODO: download
          }}
        />
      </ThemedScreenView>
      <TransferFileListBottomSheet
        assets={transfer.assets}
        snapPoints={['20%', '50%', '80%']}
        defaultIndex={1}
      />
    </GestureHandlerRootView>
  );
}

const useStyles = () => {
  return useThemedStyleSheet((theme) => {
    return {
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.base,
      },
    };
  }, []);
};

const useReceiveTransferViewStyles = () => {
  return useThemedStyleSheet((theme) => {
    return {
      container: {
        gap: 16,
      },
      downloadFilesButton: {
        width: '100%',
      },
      textMuted: {
        color: theme.colors.base_fg_muted,
      },
      textStrong: {
        fontWeight: 'bold',
      },
      statsTable: {
        borderWidth: 1,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.base_light,
        borderColor: 'transparent',
        flexDirection: 'column',
        gap: 16,
      },
      statsSeparator: {
        marginInline: 8,
        marginBlock: 4,
        borderTopWidth: 1,
        borderTopColor: theme.colors.base_border,
      },
      statsItem: {
        padding: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      },
      statsItemValue: {
        textAlign: 'right',
        color: theme.colors.base_fg_muted,
      },
    };
  }, []);
};
