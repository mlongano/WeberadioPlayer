import React, { Component, useEffect, useRef, useState } from 'react';
import Header from './Header';
import AlbumArt from './AlbumArt';
import TrackDetails from './TrackDetails';
import Controls from './Controls';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
  const volumeSlider = useRef<any>(null);
  const audioControls = useRef<any>(null);

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
      <Header message="Playing from webe.radio" />
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
        <Icon2 name='radio-tower' color={'rgb(253 224 71)'} size={20} />
        <Text style={{ color: 'rgb(253 224 71)', fontSize: 20, fontWeight: 'bold', marginTop: 0, marginLeft: 0, marginRight: 0 }}>WeBe Radio</Text>
        <Icon2 name='radio-tower' color={'whrgb(253 224 71)ite'} size={20} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
        <Text style={{ color: 'rgb(253 224 71)', fontSize: 10, fontWeight: 'bold', marginBottom: 20, marginLeft: 0, marginRight: 0}}>Ascoltatori: {songMetadata?.listeners}</Text>
      </View>

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
        style={styles.audioElement} />

      <View style={{ flexDirection: 'row', }} >
        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: 10, marginLeft: 15, marginRight: 0, width: 20 }}>{Math.round(volume * 100)}</Text>
        <Slider
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          onValueChange={changeVolume}
          value={volume}
          style={{ flex: 1, marginLeft: 0, marginRight: 10, marginTop: 10, marginBottom: 10 }}
          minimumTrackTintColor='#fff'
          maximumTrackTintColor='rgba(255, 255, 255, 0.14)'
        />
        <Icon.Button name='volume-down' color={'white'} backgroundColor={'transparent'} size={20}
          onPress={volumeDown} />
        <Icon.Button name='volume-off' color={'white'} backgroundColor={'transparent'} size={20}
          onPress={toggleMute} />
        <Icon.Button name='volume-up' color={'white'} backgroundColor={'transparent'} size={20}
          onPress={volumeUp} />

      </View>

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
