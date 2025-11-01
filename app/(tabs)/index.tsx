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

export default function App(): React.JSX.Element {
  const { songMetadata, cover } = useSongMetadata();
  const playbackState = Platform.OS === 'android' ? usePlaybackState() : { state: State.Stopped };
  const [isPlayingTrackPlayer, setIsPlayingTrackPlayer] = useState(false);
  const [isPlayingIOS, setIsPlayingIOS] = useState(false);
  const [currentSource, setCurrentSource] = useState<AudioSource | null>(null);
  const videoRef = useRef(null);

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
    if (Platform.OS === 'android' && songMetadata.title && songMetadata.artist) {
      updateTrackPlayerMetadata();
    }
  }, [songMetadata, cover]);

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
    }
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

  async function togglePlayback() {
    if (Platform.OS === 'android') {
      const isPlaying = await audioManager.isPlaying();
      if (isPlaying) {
        await audioManager.stop();
      } else {
        await audioManager.playRadio(webeRadioStream);
      }
    } else {
      // iOS: toggle video playback
      setIsPlayingIOS(!isPlayingIOS);
    }
  }
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
        isPlaying={Platform.OS === 'android' ? isPlayingTrackPlayer : isPlayingIOS}
        onPressPlay={togglePlayback}
        onPressPause={togglePlayback}
        theme={theme}
      />
      <AlbumArt url={currentSource?.artwork || cover} />
      <TrackDetails
        title={currentSource?.title || songMetadata.title}
        artist={currentSource?.artist || songMetadata.artist}
        album={currentSource?.metadata?.album || songMetadata?.album || ''}
        year={currentSource?.metadata?.year || songMetadata?.year || ''}
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
          source={{ uri: webeRadioStream.url }}
          style={styles.audioElement}
          paused={!isPlayingIOS}
          repeat={true}
          playInBackground={true}
          playWhenInactive={true}
          ignoreSilentSwitch="ignore"
        />
      )}
    </ScrollView>
  );
}
