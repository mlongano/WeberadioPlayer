import { useEffect, useState } from 'react';
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

import { ScrollView, StyleSheet } from 'react-native';
import VolumeControl from '../components/VolumeControl';
import Header from '../components/Header';
import useSongMetadata from '../hooks/useSongMetadata';
import useAudioControls from '../hooks/useAudioControls';
import { useTheme } from 'react-native-paper';
import React from 'react';

export default function App(): React.JSX.Element {
  const { songMetadata, cover } = useSongMetadata();
  const playbackState = usePlaybackState();
  //console.log("playbackState: ", playbackState);
  const [isPlayingTrackPlayer, setIsPlayingTrackPlayer] = useState(false);
  //const { position, buffered, duration } = useProgress();

  useEffect(() => {
    setIsPlaying();
  }, [playbackState]);

  async function setIsPlaying() {
    if (
      playbackState.state === State.Playing &&
      (await TrackPlayer.getVolume()) > 0
    ) {
      setIsPlayingTrackPlayer(true);
    } else {
      setIsPlayingTrackPlayer(false);
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
    title: 'WeBe Radio',
    artist: 'WeBe Radio',
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
    setupTrackPlayer();
  }, []);

  async function setupTrackPlayer() {
    try {
      // TrackPlayer is already set up globally in _layout.tsx
      // Just add tracks and configure for this screen
      await TrackPlayer.add(tracks);
      await TrackPlayer.setRepeatMode(RepeatMode.Queue);
      // Start with volume at 50% instead of muted
      await TrackPlayer.setVolume(0.5);
      // Don't auto-play here, let user control playback
      // await TrackPlayer.play();
    } catch (error) {
      console.log('Error setting up TrackPlayer: ', error);
    }
  }

  async function togglePlayback() {
    const currentState = await TrackPlayer.getPlaybackState();
    if (currentState.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
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
        isPlaying={isPlayingTrackPlayer}
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
    </ScrollView>
  );
}
