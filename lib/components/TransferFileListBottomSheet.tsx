import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
import { View } from 'react-native';
import { formatMimeType, formatSize } from '../formats';
import type { Database } from '../supabase-types';
import { useThemedStyleSheet } from '../theme';
import ThemedH2 from './ThemedH2';
import ThemedText from './ThemedText';

export default function TransferFileListBottomSheet({
  assets,
  defaultIndex,
  snapPoints: propSnapPoints,
}: {
  assets: Database['public']['Tables']['transfers']['Row']['assets'];
  defaultIndex?: number;
  snapPoints?: string[]
}) {
  const styles = useStyles();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => propSnapPoints ?? ['20%', '50%', '80%'], [propSnapPoints]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      enableDynamicSizing={false}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
      snapPoints={snapPoints}
      index={defaultIndex}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ThemedH2>File List</ThemedH2>
        <ThemedText style={styles.helpText}>
          {assets.length} files •{' '}
          {formatSize(assets.reduce((total, asset) => total + asset.size, 0))}
        </ThemedText>
        <BottomSheetFlatList
          style={styles.list}
          data={assets}
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

const useStyles = () => {
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
