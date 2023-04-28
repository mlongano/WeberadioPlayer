import React, { Component, useEffect, useRef, useState } from 'react';
import TopBar from './TopBar';
import AlbumArt from './AlbumArt';
import TrackDetails from './TrackDetails';
import Controls from './Controls';
import Video from 'react-native-video';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';

import { io } from 'socket.io-client';
import { clamp } from './utils/helpers';

import {
  View,
  Text,
  useColorScheme,
  ScrollView,
} from 'react-native';
import VolumeBar from './VolumeBar';
import Slider from '@react-native-community/slider';
import VolumeControl from './VolumeControl';
import Header from './Header';

interface SongMetadata {
  title: string;
  artist: string;
  album?: string;
  year?: string;
  coverUrl?: string;
  listeners?: number;
}
export default function App(): JSX.Element {
  const defaultCoverLight = "https://webe.radio/images/logo-light.png";
  const defaultCoverDark = "https://webe.radio/images/logo-dark.png";
  const songSrc = "https://stream.webe.radio/live";
  const [songMetadata, setSongMetadata] = useState<SongMetadata>({ title: '', artist: '', album: '', year: '', coverUrl: '', listeners: 0 });
  const colorMode = useColorScheme();
  console.log("colorMode: ", colorMode);

  const [defaultCover, setDefaultCover] = useState<String | any>(colorMode === "light" ? defaultCoverLight : defaultCoverDark);
  const [cover, setCover] = useState<string>(defaultCover);

  // Change default cover when color mode changes
  useEffect(() => {
    const nextDefaultCover = colorMode === "light" ? defaultCoverLight : defaultCoverDark;
    if (cover === defaultCover) {
      setCover(nextDefaultCover);
    }
    setDefaultCover(nextDefaultCover);
  }, [colorMode]);

  // Get current song metadata on WeBe Radio from the socket.io server at https://metadata.webe.radio
  useEffect(() => {
    console.log("Connecting...");
    const socket = io("https://metadata.webe.radio");

    try {
      socket.on('connect', () => {
        console.log("Connected!");
      });

      socket.on('metadata', (data) => {
        console.log("metadata: ", data);
        setSongMetadata(data);
        setCover(data.coverUrl)
      });
    } catch (e) {
      console.log("Error: ", e);
    }
    return () => {
      socket.disconnect();
    }
  }, []);

  // Audio player controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [oldVolume, setOldVolume] = useState(volume);
  const audioPlayer = useRef<any>(null);

  function togglePlay() {
    const nextIsPlaying = !isPlaying;
    setIsPlaying(nextIsPlaying);
  }

  function changeVolume(volume: number) {

    const nextVolume = Math.round(clamp(0, volume, 1) * 100) / 100;

    setVolume(nextVolume);
  }

  function changeVolumeBy(delta: number) {
    const nextVolume = clamp(0, volume + delta, 1);
    setVolume(nextVolume);
  }

  function volumeDown() {
    changeVolumeBy(-0.10);
  }

  function volumeUp() {
    changeVolumeBy(0.10);
  }

  function toggleMute() {
    if (volume > 0) {
      setOldVolume(volume);
    }
    const nextVolume = volume === 0 ? oldVolume : 0;
    setVolume(nextVolume);
    audioPlayer && audioPlayer.current && (audioPlayer.current.volume = nextVolume);
  }


  return (
    <ScrollView style={styles.container}>
      <TopBar message="Playing from webe.radio" />
      <Header ascoltatori={songMetadata?.listeners || 0}  color='rgb(253 224 71)' titleSize={20}
      subtitleSize={10}/>
      <Controls isPlaying={isPlaying}
        onPressPlay={togglePlay}
        onPressPause={togglePlay}
      />
      <AlbumArt url={cover || defaultCover} />
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
        onProgress={(data) => {
          console.log("progress: ", data);
        }}
         />

      <VolumeControl volume={volume} setVolume={changeVolume} toggleMute={toggleMute} volumeDown={volumeDown}  volumeUp={volumeUp}/>

    </ScrollView>
  );
}


const styles = {
  container: {
    flex: 1,
    backgroundColor: 'rgb(4,4,4)',
  },
  audioElement: {
    height: 0,
    width: 0,
  }
}
