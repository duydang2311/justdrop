import ThemedActivityIndicator from '@/lib/components/ThemedActivityIndicator';
import ThemedButton from '@/lib/components/ThemedButton';
import ThemedScreenView from '@/lib/components/ThemedScreenView';
import ThemedText from '@/lib/components/ThemedText';
import TransferFileListBottomSheet from '@/lib/components/TransferFileListBottomSheet';
import { formatMimeType, formatSize } from '@/lib/formats';
import { useTransferQuery } from '@/lib/queries';
import { useServices } from '@/lib/stores/services';
import type { Database } from '@/lib/supabase-types';
import { useThemedStyleSheet } from '@/lib/theme';
import { attempt } from '@duydang2311/attempt';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import invariant from 'tiny-invariant';
import { useShallow } from 'zustand/shallow';

export default function Index() {
  const { id } = useLocalSearchParams();
  invariant(id, 'id must not be null');
  invariant(typeof id === 'string', 'id must be a string');

  const { isPending, error, data } = useTransferQuery(id);

  if (isPending) {
    return (
      <ThemedScreenView style={styles.container}>
        <ThemedActivityIndicator />
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

  return <ReceiveTransferView transfer={data} />;
}

function ReceiveTransferView({
  transfer,
}: {
  transfer: Database['public']['Tables']['transfers']['Row'];
}) {
  const styles = useReceiveTransferViewStyles();
  const stats = useStats(transfer.assets);
  const { supabase, transferPeerManager } = useServices(
    useShallow(({ supabase, transferPeerManager }) => ({
      supabase,
      transferPeerManager,
    }))
  );

  const handleDownloadFiles = async () => {
    const inserted = await supabase
      .from('transfer_peers')
      .insert({
        transfer_id: transfer.id,
        status: 'pending',
      })
      .select('id')
      .single();

    if (inserted.error) {
      console.error('Failed to insert transfer peer:', inserted.error);
      return;
    }

    transferPeerManager.watchOffer(inserted.data.id);
  };

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
          onPress={handleDownloadFiles}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

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

const useStats = (
  assets: Database['public']['Tables']['transfers']['Row']['assets']
) => {
  return useMemo(
    () => [
      {
        label: 'Total Files',
        value: assets.length.toString(),
      },
      {
        label: 'Total Size',
        value: formatSize(
          assets.reduce((total, asset) => total + asset.size, 0)
        ),
      },
      {
        label: 'File Types',
        value: Array.from(
          new Set(assets.map((asset) => asset.mimeType)).values()
        )
          .map(formatMimeType)
          .join(', '),
      },
    ],
    [assets]
  );
};

const useHandleDownloadFiles = (transferId: string) => {
  const supabase = useServices((a) => a.supabase);
  return useCallback(async () => {
    const inserted = await supabase.from('transfer_peers').insert({
      transfer_id: transferId,
      status: 'pending',
    });

    if (inserted.error) {
      return attempt.fail(inserted.error);
    }

    return attempt.ok(inserted.data);
  }, [supabase, transferId]);
};
