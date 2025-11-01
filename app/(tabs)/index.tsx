import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import AlbumArt from '../components/AlbumArt';
import TrackDetails from '../components/TrackDetails';
import Controls from '../components/Controls';
import TrackPlayer, {
  State,
  Capability,
  RepeatMode,
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

export default function App(): React.JSX.Element {
  const { songMetadata, cover } = useSongMetadata();
  const playbackState = Platform.OS === 'android' ? usePlaybackState() : { state: State.Stopped };
  //console.log("playbackState: ", playbackState);
  const [isPlayingTrackPlayer, setIsPlayingTrackPlayer] = useState(false);
  const [isPlayingIOS, setIsPlayingIOS] = useState(false);
  const videoRef = useRef(null);
  //const { position, buffered, duration } = useProgress();

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

  const webeRadioStream = {
    id: 'webe-radio-stream',
    url: 'https://stream.webe.radio/live',
    title: songMetadata.title || 'WeBe Radio',
    artist: songMetadata.artist || 'WeBe Radio',
    artwork: cover,
    isLiveStream: true,
  };

  const radioParadiseStream = {
    id: 'radio-paradise-stream',
    url: 'http://stream-uk1.radioparadise.com/aac-320',
    title: 'Radio Paradise',
    artist: 'Radio Paradise',
    isLiveStream: true,
  };

  const tracks = [webeRadioStream];

  useEffect(() => {
    if (Platform.OS === 'android') {
      setupTrackPlayer();
    }
  }, []);

  async function setupTrackPlayer() {
    if (Platform.OS === 'android') {
      try {
        // TrackPlayer is already set up globally in _layout.tsx
        // Just add tracks and configure for this screen
        await TrackPlayer.add([webeRadioStream]);
        await TrackPlayer.setRepeatMode(RepeatMode.Queue);
        // Start with volume at 50% instead of muted
        await TrackPlayer.setVolume(0.5);
        // Don't auto-play here, let user control playback
        // await TrackPlayer.play();
      } catch (error) {
        console.log('Error setting up TrackPlayer: ', error);
      }
    }
  }

  async function togglePlayback() {
    if (Platform.OS === 'android') {
      const currentState = await TrackPlayer.getPlaybackState();
      if (currentState.state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
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
      <AlbumArt url={cover} />
      <TrackDetails
        title={songMetadata.title}
        artist={songMetadata.artist}
        album={songMetadata?.album || ''}
        year={songMetadata?.year || ''}
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
