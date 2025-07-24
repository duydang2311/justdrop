import ThemedButton from '@/lib/components/ThemedButton';
import ThemedH2 from '@/lib/components/ThemedH2';
import ThemedText from '@/lib/components/ThemedText';
import { useApp } from '@/lib/stores/app';
import { useServices } from '@/lib/stores/services';
import { useThemedStyleSheet } from '@/lib/theme';
import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system/next';
import { useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { RTCPeerConnection } from 'react-native-webrtc';
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
  const [transferId, setTransferId] = useState<string | null>(null);

  invariant(session, 'session must not be null');

  const handlePress = async () => {
    const result = await getDocumentAsync({
      copyToCacheDirectory: false,
      multiple: true,
    });

    if (result.canceled) {
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    const offer = await pc.createOffer(undefined);
    await pc.setLocalDescription(offer);

    const transfer = await supabase
      .from('transfers')
      .insert({
        created_by: session.user.id, // TODO: use db trigger
        assets: result.assets.map((a) => ({
          uri: a.uri,
          name: a.name,
          size: a.size ?? 0,
          mimeType: a.mimeType,
        })),
        offer_sdp: offer.sdp,
      })
      .select('id')
      .single();

    if (transfer.error) {
      console.error('Error creating transfer:', transfer.error);
      pc.close();
      return;
    }

    const transferId = transfer.data.id;
    setTransferId(transferId);

    const files = result.assets.map((a) => new File(a.uri));
    const transfersDir = new Directory(Paths.document, 'transfers');
    if (!transfersDir.exists) {
      transfersDir.create();
    }

    const transferIdDir = new Directory(transfersDir, transferId);
    if (!transferIdDir.exists) {
      transferIdDir.create();
    }
    for (const file of files) {
      file.move(transferIdDir);
    }

    await new Promise<void>((resolve) => {
      pc.addEventListener('icecandidate', async (event) => {
        console.warn('ICE candidate:', event.candidate);
        if (event.candidate == null) {
          resolve();
          return;
        }
        const insert = await supabase.from('transfer_candidates').insert({
          transfer_id: transferId,
          peer: 'offer',
          candidate: JSON.stringify(event.candidate),
        });
        if (insert.error) {
          console.error('Error inserting offer ICE candidate:', insert.error);
        }
      });
    });
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
        {transferId != null && (
          <QRCode value={`justdrop://transfers/${transferId}`} />
        )}
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
