import React, {  } from 'react';
import TopBar from './TopBar';
import AlbumArt from './AlbumArt';
import TrackDetails from './TrackDetails';
import Controls from './Controls';
import Video from 'react-native-video';


import {
  ScrollView,
  StyleSheet,
} from 'react-native';
import VolumeControl from './VolumeControl';
import Header from './Header';
import useSongMetadata from './hooks/useSongMetadata';
import useAudioControls from './hooks/useAudioControls';

export default function App(): JSX.Element {
  const { songMetadata, cover } = useSongMetadata();

  // Audio player controls
  const { isPlaying, volume, audioPlayer, togglePlay, changeVolume, toggleMute, volumeDown, volumeUp } = useAudioControls();

  const songSrc = "https://stream.webe.radio/live";

  return (
    <ScrollView style={styles.container}>
      <TopBar message="Playing from webe.radio" />
      <Header ascoltatori={songMetadata?.listeners || 0} color='rgb(253 224 71)' titleSize={20}
        subtitleSize={10} />
      <Controls isPlaying={isPlaying}
        onPressPlay={togglePlay}
        onPressPause={togglePlay}
      />
      <AlbumArt url={cover} />
      <TrackDetails
        title={songMetadata.title}
        artist={songMetadata.artist}
        album={songMetadata?.album || ''}
        year={songMetadata?.year || ''}
      />
      <Video source={{ uri: songSrc }} // Can be a URL or a local file.
        ref={audioPlayer}
        paused={!isPlaying}               // Pauses playback entirely.
        volume={volume}                   // 0 is muted, 1 is normal.
        muted={false}                     // Mutes the audio entirely.
        resizeMode="cover"                // Fill the whole screen at aspect ratio.*
        repeat={true}                     // Repeat forever.

        playInBackground={true}           // Audio continues to play when app entering background.
        playWhenInactive={true}           // [iOS] Video continues to play when control or notification center are shown.
        ignoreSilentSwitch={"ignore"}     // [iOS] ignore | obey - When 'ignore', audio will still play with the iOS hard silent switch set to silent. When 'obey', audio will toggle with the switch. When not specified, will inherit audio settings as usual.
        progressUpdateInterval={250.0}    // [iOS] Interval to fire onProgress (default to ~250ms)
        onEnd={() => { console.log('Done!') }}
        style={styles.audioElement}
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
