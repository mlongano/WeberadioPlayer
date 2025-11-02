import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import AlbumArt from '../components/AlbumArt';
import TrackDetails from '../components/TrackDetails';
import Controls from '../components/Controls';
import TrackPlayer, {
  State,
  Capability,
  RepeatMode,
  Event,
  usePlaybackState,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import Video from 'react-native-video';

import { ScrollView, StyleSheet } from 'react-native';
import VolumeControl from '../components/VolumeControl';
import Header from '../components/Header';
import useSongMetadata from '../hooks/useSongMetadata';
import useAudioControls from '../hooks/useAudioControls';
import { useTheme } from 'react-native-paper';
import React from 'react';
import { audioManager, AudioSource } from '../../src/services/AudioManager';
import { icecastMetadataService } from '../../src/services/IcecastMetadataService';

export default function App(): React.JSX.Element {
  const { songMetadata, cover } = useSongMetadata();
  const playbackState = Platform.OS === 'android' ? usePlaybackState() : { state: State.Stopped };
  const [isPlayingTrackPlayer, setIsPlayingTrackPlayer] = useState(false);
  const [currentSource, setCurrentSource] = useState<AudioSource | null>(null);
  const videoRef = useRef(null);

  // Register Video ref with AudioManager for iOS
  useEffect(() => {
    if (Platform.OS === 'ios') {
      audioManager.registerVideoRef(webeRadioStream.id, videoRef.current);
    }
    return () => {
      if (Platform.OS === 'ios') {
        audioManager.unregisterVideoRef(webeRadioStream.id);
      }
    };
  }, []);

  // Listen for audio source changes
  useEffect(() => {
    const unsubscribe = audioManager.onSourceChange((source) => {
      setCurrentSource(source);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setIsPlaying();
    }
  }, [playbackState]);

  useEffect(() => {
    if (Platform.OS === 'android' && songMetadata.title && songMetadata.artist && currentSource?.id === webeRadioStream.id) {
      updateTrackPlayerMetadata();
    }
  }, [songMetadata, cover, currentSource]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setIsPlaying();
    }
  }, [playbackState]);

  async function updateTrackPlayerMetadata() {
    if (Platform.OS === 'android') {
      try {
        await TrackPlayer.updateNowPlayingMetadata({
          title: songMetadata.title,
          artist: songMetadata.artist,
          album: songMetadata.album || 'WeBe Radio',
          artwork: cover,
        });
      } catch (error) {
        console.log('Error updating TrackPlayer metadata: ', error);
      }
    }
  }

  async function setIsPlaying() {
    if (Platform.OS === 'android') {
      if (
        playbackState.state === State.Playing &&
        (await TrackPlayer.getVolume()) > 0
      ) {
        setIsPlayingTrackPlayer(true);
      } else {
        setIsPlayingTrackPlayer(false);
      }
    }
  }

  // Audio player controls
  const {
    isPlaying,
    volume,
    togglePlay,
    changeVolume,
    toggleMute,
    volumeDown,
    volumeUp,
  } = useAudioControls();

  const webeRadioStream: AudioSource = {
    id: 'webe-radio-stream',
    url: 'https://stream.webe.radio/live',
    title: songMetadata.title || 'WeBe Radio',
    artist: songMetadata.artist || 'WeBe Radio',
    artwork: cover,
    type: 'radio',
  };

  const radioParadiseStream: AudioSource = {
    id: 'radio-paradise-stream',
    url: 'http://stream-uk1.radioparadise.com/aac-320',
    title: 'Radio Paradise',
    artist: 'Radio Paradise',
    type: 'radio',
  };

  const tracks = [webeRadioStream];

  useEffect(() => {
    if (Platform.OS === 'android') {
      setupTrackPlayer();
      // Also set up event listeners in the main app for notification controls
      setupNotificationListeners();
      // Set up ICY metadata listener as backup
      setupIcyMetadataListener();
    }
    // iOS metadata is handled via Video component's onTimedMetadata callback
  }, []);

  async function setupNotificationListeners() {
    if (Platform.OS === 'android') {
      // Add event listeners in the main app as backup
      TrackPlayer.addEventListener(Event.RemotePlay, () => {
        console.log('Main app: remote play triggered');
        TrackPlayer.play();
      });
      TrackPlayer.addEventListener(Event.RemotePause, () => {
        console.log('Main app: remote pause triggered');
        TrackPlayer.pause();
      });
    }
  }

  async function setupTrackPlayer() {
    if (Platform.OS === 'android') {
      try {
        // TrackPlayer is already set up globally in _layout.tsx
        // Just ensure we have the radio stream ready
        // The AudioManager will handle the actual playback
      } catch (error) {
        console.log('Error setting up TrackPlayer: ', error);
      }
    }
  }

  async function setupIcyMetadataListener() {
    if (Platform.OS === 'android') {
      try {
        console.log('Setting up ICY metadata listener...');

        // Listen for ICY metadata from the stream
        // MetadataTimedReceived gives us raw ICY metadata
        const timedMetadataSubscription = TrackPlayer.addEventListener(
          Event.MetadataTimedReceived,
          async (event: any) => {
            // Check if we're playing the radio stream (not a podcast)
            const currentTrack = await TrackPlayer.getActiveTrack();
            const isRadioStream = currentTrack?.url === 'https://stream.webe.radio/live';

            if (!isRadioStream) {
              // Silently ignore ICY metadata when not playing radio
              return;
            }

            console.log('=== ICY Metadata Received ===');
            console.log('Current track URL:', currentTrack?.url);

            // Extract raw ICY StreamTitle from timed metadata
            // Structure: event.metadata[0].title contains the full "Title - Artist - Year - Album"
            let rawTitle = '';

            if (event.metadata && Array.isArray(event.metadata) && event.metadata.length > 0) {
              rawTitle = event.metadata[0].title || '';
            }

            console.log('Raw ICY StreamTitle:', rawTitle);

            if (rawTitle && rawTitle !== 'WeBe Radio') {
              console.log('Processing ICY metadata and fetching cover...');

              // Use IcecastMetadataService to parse and enrich with cover
              const enrichedMetadata = await icecastMetadataService.processIcyMetadata(rawTitle);

              console.log('Enriched metadata:', {
                title: enrichedMetadata.title,
                artist: enrichedMetadata.artist,
                album: enrichedMetadata.album,
                year: enrichedMetadata.year,
                coverUrl: enrichedMetadata.coverUrl,
              });

              // Also update TrackPlayer notification
              try {
                await TrackPlayer.updateNowPlayingMetadata({
                  title: enrichedMetadata.title,
                  artist: enrichedMetadata.artist,
                  album: enrichedMetadata.album || 'WeBe Radio',
                  artwork: enrichedMetadata.coverUrl,
                });
                console.log('TrackPlayer metadata updated successfully');
              } catch (error) {
                console.error('Error updating TrackPlayer metadata:', error);
              }
            } else {
              console.log('Ignoring station name or empty metadata');
            }
          }
        );

        console.log('ICY metadata listener registered');
        return timedMetadataSubscription;
      } catch (error) {
        console.log('Error setting up ICY metadata listener:', error);
      }
    }
  }

  async function togglePlayback() {
    const isPlaying = await audioManager.isPlaying();
    if (isPlaying) {
      await audioManager.stop();
    } else {
      await audioManager.playRadio(webeRadioStream);
    }
  }

  // Handle iOS Video ICY metadata
  const handleIOSTimedMetadata = async (metadata: any) => {
    if (Platform.OS === 'ios') {
      console.log('=== iOS ICY Metadata Received ===');
      console.log('Metadata:', JSON.stringify(metadata, null, 2));

      // Check if we're playing the radio stream (not a podcast)
      if (currentSource?.id !== webeRadioStream.id) {
        console.log('Not playing radio stream, ignoring metadata');
        return;
      }

      // Extract StreamTitle from timed metadata
      // react-native-video provides metadata as an array of objects with identifier and value
      let rawTitle = '';

      if (metadata && metadata.metadata && Array.isArray(metadata.metadata)) {
        // Find the StreamTitle in metadata array
        const streamTitleItem = metadata.metadata.find((item: any) =>
          item.identifier === 'icy/StreamTitle' ||
          item.identifier === 'StreamTitle' ||
          item.key === 'StreamTitle'
        );

        if (streamTitleItem) {
          rawTitle = streamTitleItem.value || '';
        }
      }

      console.log('Raw ICY StreamTitle:', rawTitle);

      if (rawTitle && rawTitle !== 'WeBe Radio') {
        console.log('Processing ICY metadata and fetching cover...');

        // Use IcecastMetadataService to parse and enrich with cover
        const enrichedMetadata = await icecastMetadataService.processIcyMetadata(rawTitle);

        console.log('Enriched metadata:', {
          title: enrichedMetadata.title,
          artist: enrichedMetadata.artist,
          album: enrichedMetadata.album,
          year: enrichedMetadata.year,
          coverUrl: enrichedMetadata.coverUrl,
        });
      } else {
        console.log('Ignoring station name or empty metadata');
      }
    }
  };

  const theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    audioElement: {
      height: 0,
      width: 0,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Header
        ascoltatori={songMetadata?.listeners || 0}
        color={theme.colors.primary}
        titleSize={20}
        subtitleSize={10}
      />
      <Controls
        isPlaying={Platform.OS === 'android' ? isPlayingTrackPlayer : (currentSource !== null)}
        onPressPlay={togglePlayback}
        onPressPause={togglePlayback}
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
        setVolume={changeVolume}
        toggleMute={toggleMute}
        volumeDown={volumeDown}
        volumeUp={volumeUp}
        theme={theme}
      />
      {Platform.OS === 'ios' && (
        <Video
          ref={videoRef}
          source={{
            uri: webeRadioStream.url,
            headers: {
              'User-Agent': 'WeBeRadioApp/1.0',
              'Accept': '*/*',
              'Icy-MetaData': '1',
            },
            type: 'mp3', // Specify stream type
          }}
          style={styles.audioElement}
          paused={currentSource?.id !== webeRadioStream.id}
          repeat={true}
          playInBackground={true}
          playWhenInactive={true}
          ignoreSilentSwitch="ignore"
          disableFocus={true}
          resizeMode="cover"
          controls={false}
          muted={false}
          volume={volume}
          rate={1.0}
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000,
          }}
          onError={(error) => {
            console.log('iOS Video Error:', error);
          }}
          onLoadStart={() => {
            console.log('iOS Video Load Start');
          }}
          onLoad={() => {
            console.log('iOS Video Loaded');
          }}
          onBuffer={(buffer) => {
            console.log('iOS Video Buffer:', buffer);
          }}
          onTimedMetadata={handleIOSTimedMetadata}
        />
      )}
    </ScrollView>
  );
}
