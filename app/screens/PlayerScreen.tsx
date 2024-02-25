import {useEffect, useState} from 'react';
import AlbumArt from '../components/AlbumArt';
import TrackDetails from '../components/TrackDetails';
import Controls from '../components/Controls';
import TrackPlayer, {
  State,
  Capability,
  RepeatMode,
  usePlaybackState,
  useProgress,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';

import {ScrollView, StyleSheet} from 'react-native';
import VolumeControl from '../components/VolumeControl';
import Header from '../components/Header';
import useSongMetadata from '../hooks/useSongMetadata';
import useAudioControls from '../hooks/useAudioControls';
import {useTheme} from 'react-native-paper';

export default function App(): JSX.Element {
  const {songMetadata, cover} = useSongMetadata();
  const playbackState = usePlaybackState();
  //console.log("playbackState: ", playbackState);
  const [isPlayingTrackPlayer, setIsPlayingTrackPlayer] = useState(false);
  const {position, buffered, duration} = useProgress();

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
      await TrackPlayer.setupPlayer();
    } catch (error) {
      console.log('Error setting up TrackPlayer: ', error);
    }
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.JumpForward,
      ],
    });
    await TrackPlayer.add(tracks);
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    await toggleMute();
    await TrackPlayer.play();
    //console.log("Setup done: ", await TrackPlayer.getQueue());
  }

  async function togglePlayback() {
    await toggleMute();
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
        isPlaying={isPlaying}
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
