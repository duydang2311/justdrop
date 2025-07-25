import ThemedButton from '@/lib/components/ThemedButton';
import ThemedH2 from '@/lib/components/ThemedH2';
import ThemedText from '@/lib/components/ThemedText';
import { useApp } from '@/lib/stores/app';
import { useServices } from '@/lib/stores/services';
import { AppSupabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase-types';
import { useThemedStyleSheet } from '@/lib/theme';
import { attempt } from '@duydang2311/attempt';
import { DocumentPickerAsset, getDocumentAsync } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system/next';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView } from 'react-native';
import type { } from 'react-native-webrtc';
import invariant from 'tiny-invariant';

declare module 'react-native-webrtc' {
  interface RTCPeerConnection {
    addEventListener(
      type: 'icecandidate',
      listener: (event: RTCPeerConnectionIceEvent) => void
    ): void;
  }
}

export default function Index() {
  const styles = useStyles();
  const supabase = useServices((a) => a.supabase);
  const session = useApp((a) => a.session);
  const router = useRouter();

  invariant(session, 'session must not be null');

  const handlePress = async () => {
    const result = await getDocumentAsync({
      copyToCacheDirectory: false,
      multiple: true,
    });

    if (result.canceled) {
      return;
    }

    const created = await createTransfer(supabase)({
      created_by: session.user.id, // TODO: use db trigger
      assets: result.assets.map((a) => ({
        name: a.name,
        size: a.size ?? 0,
        mimeType: a.mimeType,
      })),
    });

    if (created.failed) {
      console.error('Error creating transfer:', created.error);
      return;
    }

    const transferId = created.data.id;
    const copied = copyAssetsToDocumentDir(transferId, result.assets);
    if (copied.failed) {
      console.error('Error moving assets to document directory:', copied.error);
      return;
    }

    router.navigate(`/transfers/${transferId}`);

    // await new Promise<void>((resolve) => {
    //   pc.addEventListener('icecandidate', async (event) => {
    //     console.warn('ICE candidate:', event.candidate);
    //     if (event.candidate == null) {
    //       resolve();
    //       return;
    //     }
    //     const insert = await supabase.from('transfer_candidates').insert({
    //       transfer_id: transferId,
    //       peer: 'offer',
    //       candidate: JSON.stringify(event.candidate),
    //     });
    //     if (insert.error) {
    //       console.error('Error inserting offer ICE candidate:', insert.error);
    //     }
    //   });
    // });
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

const createTransfer =
  (supabase: AppSupabase) =>
  async (values: Database['public']['Tables']['transfers']['Insert']) => {
    const transfer = await supabase
      .from('transfers')
      .insert(values)
      .select('id')
      .single();

    if (transfer.error) {
      console.error('Error creating transfer:', transfer.error);
      return attempt.fail(transfer.error);
    }

    return attempt.ok(transfer.data);
  };

const copyAssetsToDocumentDir = (
  transferId: string,
  assets: DocumentPickerAsset[]
) => {
  return attempt.sync(() => {
    const files = assets.map((a) => new File(a.uri));
    const transferIdDir = new Directory(
      Paths.document,
      'transfers',
      transferId
    );
    if (!transferIdDir.exists) {
      transferIdDir.create({ intermediates: true });
    }
    for (const file of files) {
      file.copy(transferIdDir);
    }
  })();
};
