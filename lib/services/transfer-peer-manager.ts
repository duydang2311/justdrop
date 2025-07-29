import { attempt } from '@duydang2311/attempt';
import type { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js';
import { isPlainObject } from 'is-what';
import { RTCPeerConnection } from 'react-native-webrtc';
import invariant from 'tiny-invariant';
import type { AppSupabase } from '../supabase';
import type { Tables } from '../supabase-types';

import type { } from 'react-native-webrtc';
declare module 'react-native-webrtc' {
  interface RTCPeerConnection {
    addEventListener(
      type: 'icecandidate',
      listener: (event: RTCPeerConnectionIceEvent) => void
    ): void;
  }
}

type SupabaseBroadcastPayload<TEvent extends string, TPayload> = {
  type: REALTIME_LISTEN_TYPES.BROADCAST;
  event: TEvent;
  payload: TPayload;
};

type TransferPeerInsertMessage = SupabaseBroadcastPayload<
  'INSERT',
  {
    id: Tables['transfer_peers']['Row']['id'];
    old_record: Tables['transfer_peers']['Row'];
    record: Tables['transfer_peers']['Row'];
    operation: 'INSERT';
  }
>;

type TransferPeerUpdateMessage = SupabaseBroadcastPayload<
  'UPDATE',
  {
    id: Tables['transfer_peers']['Row']['id'];
    old_record: Tables['transfer_peers']['Row'];
    record: Tables['transfer_peers']['Row'];
    operation: 'UPDATE';
  }
>;

export class TransferPeerManager {
  readonly #supabase: AppSupabase;
  readonly #offeringConnections: RTCPeerConnection[] = [];
  readonly #answeringConnections: RTCPeerConnection[] = [];

  constructor(supabase: AppSupabase) {
    this.#supabase = supabase;
  }

  async watchOffer(id: string) {
    await this.#supabase.realtime.setAuth();
    this.#supabase.realtime
      .channel(`transfer_peers:id:${id}`, {
        config: { private: true },
      })
      .on('broadcast', { event: 'UPDATE' }, async (msg) => {
        TransferPeerManager.#assertIsUpdateMessage(msg);
        const {
          payload: { id, record, old_record },
        } = msg;
        if (old_record.status !== 'pending' || record.status !== 'offered') {
          return;
        }

        const offerSdp = record.offer_sdp;
        invariant(offerSdp, 'Offer SDP must not be null');

        const conn = new RTCPeerConnection();
        const remoteSet = await attempt.async(() =>
          conn.setRemoteDescription({
            type: 'offer',
            sdp: offerSdp,
          })
        )();
        if (remoteSet.failed) {
          conn.close();
          console.error('Failed to set remote description:', remoteSet.error);
          return;
        }

        const answered = await attempt.async(() => conn.createAnswer())();
        if (answered.failed) {
          conn.close();
          console.error('Failed to create answer:', answered.error);
          return;
        }

        const answerSet = await attempt.async(() =>
          conn.setLocalDescription(answered.data)
        )();
        if (answerSet.failed) {
          conn.close();
          console.error('Failed to set local description:', answerSet.error);
          return;
        }

        await new Promise<void>((resolve) => {
          conn.addEventListener('icecandidate', async (event) => {
            if (event.candidate == null) {
              resolve();
              return;
            }
            console.debug('ICE candidate:', event.candidate);
            const inserted = await this.#supabase
              .from('transfer_peer_candidates')
              .insert({
                transfer_peer_id: id,
                peer: 'answer',
                candidate: JSON.stringify(event.candidate),
              });
            if (inserted.error) {
              console.error(
                'Error inserting answer ICE candidate:',
                inserted.error
              );
            }
          });
        });

        const updated = await this.#supabase
          .from('transfer_peers')
          .update({
            status: 'answered',
            answer_sdp: answered.data.sdp,
          })
          .eq('id', id);
        if (updated.error) {
          console.error('Failed to update transfer peer:', updated.error);
          conn.close();
          return;
        }

        this.#answeringConnections.push(conn);
      })
      .subscribe();
  }

  async watchAnswer(transferId: string) {
    await this.#supabase.realtime.setAuth();
    this.#supabase.realtime
      .channel(`transfer_peers:transferId:${transferId}`, {
        config: { private: true },
      })
      .on('broadcast', { event: 'INSERT' }, async (msg) => {
        TransferPeerManager.#assertIsInsertMessage(msg);
        const {
          payload: { old_record, record, id },
        } = msg;
        if (old_record == null && record.status === 'pending') {
          const conn = new RTCPeerConnection();
          const offered = await attempt.async(() =>
            conn.createOffer(undefined)
          )();
          if (offered.failed) {
            console.error('Failed to create offer:', offered.error);
            conn.close();
            return;
          }

          const descSet = await attempt.async(() =>
            conn.setLocalDescription(offered.data)
          )();
          if (descSet.failed) {
            console.error('Failed to set local description:', descSet.error);
            conn.close();
            return;
          }

          await new Promise<void>((resolve) => {
            conn.addEventListener('icecandidate', async (event) => {
              if (event.candidate == null) {
                resolve();
                return;
              }
              console.debug('ICE candidate:', event.candidate);
              const inserted = await this.#supabase
                .from('transfer_peer_candidates')
                .insert({
                  transfer_peer_id: id,
                  peer: 'offer',
                  candidate: JSON.stringify(event.candidate),
                });
              if (inserted.error) {
                console.error(
                  'Error inserting offer ICE candidate:',
                  inserted.error
                );
              }
            });
          });

          const updated = await this.#supabase
            .from('transfer_peers')
            .update({
              status: 'offered',
              offer_sdp: offered.data.sdp,
            })
            .eq('id', id);
          if (updated.error) {
            console.error('Failed to update transfer peer:', updated.error);
            conn.close();
            return;
          }
          this.#offeringConnections.push(conn);
        }
      })
      .subscribe();
    console.debug('watching transfer peers for transferId:', transferId);
  }

  dispose() {
    for (const conn of this.#offeringConnections) {
      console.log('close offering connection', conn);
      conn.close();
    }
    this.#offeringConnections.splice(0);

    for (const conn of this.#answeringConnections) {
      console.log('close answering connection', conn);
      conn.close();
    }
    this.#answeringConnections.splice(0);
  }

  static #assertIsUpdateMessage(msg: {
    type: 'broadcast';
    event: string;
    [key: string]: any;
  }): asserts msg is TransferPeerUpdateMessage {
    invariant(msg.event === 'UPDATE', 'Expected `event` to be "UPDATE"');
    invariant(isPlainObject(msg.payload), 'Expected `payload` to be an object');
    invariant(
      msg.payload.operation === 'UPDATE',
      'Expected `operation` to be "UPDATE"'
    );
    // todo: assert remaining properties of payload
  }

  static #assertIsInsertMessage(msg: {
    type: 'broadcast';
    event: string;
    [key: string]: any;
  }): asserts msg is TransferPeerInsertMessage {
    invariant(msg.event === 'INSERT', 'Expected `event` to be "INSERT"');
    invariant(isPlainObject(msg.payload), 'Expected `payload` to be an object');
    invariant(
      msg.payload.operation === 'INSERT',
      'Expected `operation` to be "INSERT"'
    );
    // todo: assert remaining properties of payload
  }
}
