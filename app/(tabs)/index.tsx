import React, { useEffect, useMemo } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import TrackPlayer, { Event } from 'react-native-track-player';

import AlbumArt from '@/src/components/AlbumArt';
import TrackDetails from '@/src/components/TrackDetails';
import Controls from '@/src/components/Controls';
import VolumeControl from '@/src/components/VolumeControl';
import Header from '@/src/components/Header';
import HiddenAudioPlayer from '@/src/components/HiddenAudioPlayer';

import useSongMetadata from '@/src/hooks/useSongMetadata';
import { useRadioPlayer } from '@/src/hooks/useRadioPlayer';
import { Config } from '@/src/utils/config';
import { AudioSource } from '@/src/services/AudioManager';
import { icecastMetadataService } from '@/src/services/IcecastMetadataService';

export default function App(): React.JSX.Element {
  const theme = useTheme();
  const { songMetadata, cover } = useSongMetadata();

  const {
    isPlaying,
    currentSource,
    volume,
    togglePlay,
    setVolume,
    playRadio
  } = useRadioPlayer();

  // Define streams using Config
  const webeRadioStream: AudioSource = {
    id: 'webe-radio-stream',
    url: Config.WEBE_STREAM_URL,
    title: songMetadata.title || 'WeBe Radio',
    artist: songMetadata.artist || 'WeBe Radio',
    artwork: cover,
    type: 'radio',
  };

  // Setup ICY metadata listener for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const setupIcyListener = async () => {
        const sub = TrackPlayer.addEventListener(Event.MetadataTimedReceived, async (event: any) => {
          const currentTrack = await TrackPlayer.getActiveTrack();
          const isRadioStream = currentTrack?.url === Config.WEBE_STREAM_URL;

          if (!isRadioStream) return;

          let rawTitle = '';
          if (event.metadata && Array.isArray(event.metadata) && event.metadata.length > 0) {
            rawTitle = event.metadata[0].title || '';
          }

          if (rawTitle && rawTitle !== 'WeBe Radio') {
            await icecastMetadataService.processIcyMetadata(rawTitle);

            // Update notification
            const enriched = icecastMetadataService.getLastMetadata();
            if (enriched) {
              await TrackPlayer.updateNowPlayingMetadata({
                title: enriched.title,
                artist: enriched.artist,
                album: enriched.album || 'WeBe Radio',
                artwork: enriched.coverUrl,
              });
            }
          }
        });
        return sub;
      };

      const subPromise = setupIcyListener();
      return () => {
        subPromise.then(sub => sub?.remove());
      };
    }
  }, []);

  // Handle initial play if needed or just let user control it
  // We don't auto-play.

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  }), [theme.colors.background]);

  return (
    <ScrollView style={styles.container}>
      <Header
        ascoltatori={songMetadata?.listeners || 0}
        color={theme.colors.primary}
        titleSize={20}
        subtitleSize={10}
      />
      <Controls
        isPlaying={isPlaying}
        onPressPlay={() => {
          if (!currentSource) {
            playRadio(webeRadioStream);
          } else {
            togglePlay();
          }
        }}
        onPressPause={togglePlay}
        theme={theme}
      />
      <AlbumArt url={(currentSource?.type === 'podcast' || currentSource?.type === 'episode') ? (currentSource.artwork || cover) : cover} />
      <TrackDetails
        title={(currentSource?.type === 'podcast' || currentSource?.type === 'episode') ? currentSource.title : (songMetadata.title || 'WeBe Radio')}
        artist={(currentSource?.type === 'podcast' || currentSource?.type === 'episode') ? currentSource.artist : (songMetadata.artist || 'WeBe Radio')}
        album={(currentSource?.type === 'podcast' || currentSource?.type === 'episode') ? (currentSource.metadata?.album || '') : (songMetadata.album || '')}
        year={(currentSource?.type === 'podcast' || currentSource?.type === 'episode') ? (currentSource.metadata?.year || '') : (songMetadata.year || '')}
        theme={theme}
      />
      <VolumeControl
        volume={volume}
        setVolume={setVolume}
        toggleMute={() => setVolume(volume > 0 ? 0 : 0.5)}
        volumeDown={() => setVolume(Math.max(0, volume - 0.1))}
        volumeUp={() => setVolume(Math.min(1, volume + 0.1))}
        theme={theme}
      />

      {currentSource && currentSource.type !== 'radio' && (
        <Button
          mode="contained"
          onPress={() => playRadio(webeRadioStream)}
          style={{ margin: 20, backgroundColor: theme.colors.primary }}
        >
          Torna alla diretta
        </Button>
      )}

      <HiddenAudioPlayer />
    </ScrollView>
  );
}
