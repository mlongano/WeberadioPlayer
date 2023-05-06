import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import AlbumArt from './components/AlbumArt';
import TrackDetails from './components/TrackDetails';
import Controls from './components/Controls';
import TrackPlayer, { State, Capability, RepeatMode, usePlaybackState, useProgress, AppKilledPlaybackBehavior } from 'react-native-track-player';


import {
  ScrollView,
  StyleSheet,
} from 'react-native';
import VolumeControl from './components/VolumeControl';
import Header from './components/Header';
import useSongMetadata from './hooks/useSongMetadata';
import useAudioControls from './hooks/useAudioControls';

export default function App(): JSX.Element {

  const { songMetadata, cover } = useSongMetadata();
  const playbackState = usePlaybackState();
  console.log("playbackState: ", playbackState);
  const [isPlayingTrackPlayer, setIsPlayingTrackPlayer] = useState(false);
  const { position, buffered, duration } = useProgress();

  useEffect(() => {
    setIsPlaying();
  }, [playbackState]);

  async function setIsPlaying() {
    if (playbackState.state === State.Playing && (await TrackPlayer.getVolume()) > 0) {
      setIsPlayingTrackPlayer(true);
    } else {
      setIsPlayingTrackPlayer(false);
    }
  }


  // Audio player controls
  const { isPlaying, volume, togglePlay, changeVolume, toggleMute, volumeDown, volumeUp } = useAudioControls();

  const webeRadioStream = {
    id: 'webe-radio-stream',
    url: 'https://stream.webe.radio/live',
    title: 'WeBe Radio',
    artist: 'WeBe Radio',
    isLiveStream: true,
  }

  const radioParadiseStream = {
    id: 'radio-paradise-stream',
    url: 'http://stream-uk1.radioparadise.com/aac-320',
    title: 'Radio Paradise',
    artist: 'Radio Paradise',
    isLiveStream: true,
  }

  const tracks = [
    webeRadioStream,
    ]

  useEffect(() => {
    setupTrackPlayer();
  }, []);

  async function setupTrackPlayer() {
    try {
      await TrackPlayer.setupPlayer();
    } catch (error) {
      console.log("Error setting up TrackPlayer: ", error);
    }
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification
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
    console.log("Setup done: ", await TrackPlayer.getQueue());
  }

  async function togglePlayback() {
    console.log("togglePlayback state:", playbackState);
    console.log("track progress: ", position, buffered, duration);
    console.log("isPlaying: ", isPlaying);
    console.log("Queue: ", await TrackPlayer.getQueue());
    if (playbackState.state !== State.Playing) {
      if ((await TrackPlayer.getQueue()).length === 0) {
        await TrackPlayer.add(webeRadioStream);
      }
      console.log("Track: ", await TrackPlayer.getActiveTrack());
      await TrackPlayer.play();
      togglePlay();
      return
    }
    await toggleMute();
    togglePlay();
  }


  return (
    <ScrollView style={styles.container}>
      <TopBar message="Playing from webe.radio" />
      <Header ascoltatori={songMetadata?.listeners || 0} color='rgb(253 224 71)' titleSize={20}
        subtitleSize={10} />
      <Controls isPlaying={isPlaying}
        onPressPlay={togglePlayback}
        onPressPause={togglePlayback}
      />
      <AlbumArt url={cover} />
      <TrackDetails
        title={songMetadata.title}
        artist={songMetadata.artist}
        album={songMetadata?.album || ''}
        year={songMetadata?.year || ''}
      />
      <VolumeControl volume={volume} setVolume={changeVolume} toggleMute={toggleMute} volumeDown={volumeDown} volumeUp={volumeUp} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(4,4,4)',
  },
  audioElement: {
    height: 0,
    width: 0,
  }
});
