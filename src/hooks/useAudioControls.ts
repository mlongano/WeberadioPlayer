// hooks/useAudioControls.ts
import { useState } from 'react';
import { Platform } from 'react-native';
import { clamp } from '../../src/utils/helpers';
import TrackPlayer from 'react-native-track-player';
import { audioManager } from '../../src/services/AudioManager';

export default function useAudioControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [oldVolume, setOldVolume] = useState(volume);

  function togglePlay() {
    const nextIsPlaying = !isPlaying;
    setIsPlaying(nextIsPlaying);
  }

  function changeVolume(volume: number) {
    const nextVolume = Math.round(clamp(0, volume, 1) * 100) / 100;
    setVolume(nextVolume);

    // Use AudioManager to coordinate volume across all audio sources
    audioManager.setVolume(nextVolume);
  }

  function changeVolumeBy(delta: number) {
    const nextVolume = clamp(0, volume + delta, 1);
    setVolume(nextVolume);

    // Use AudioManager to coordinate volume across all audio sources
    audioManager.setVolume(nextVolume);

    if (nextVolume >= 0.1) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }

  function volumeDown() {
    changeVolumeBy(-0.10);
  }

  function volumeUp() {
    changeVolumeBy(0.10);
  }

  async function toggleMute() {
    let currentVolume = volume; // Use state volume as default

    // Only get volume from TrackPlayer on Android
    if (Platform.OS === 'android') {
      try {
        currentVolume = await TrackPlayer.getVolume();
      } catch (error) {
        console.log('Error getting TrackPlayer volume:', error);
      }
    }

    if (currentVolume > 0) {
      setOldVolume(currentVolume);
    }

    const nextVolume = currentVolume === 0 ? oldVolume : 0;
    setVolume(nextVolume);

    if (nextVolume >= 0.1) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }

    // Use AudioManager to coordinate volume across all audio sources
    audioManager.setVolume(nextVolume);
  }

  return { isPlaying, volume, togglePlay, changeVolume, toggleMute, volumeDown, volumeUp };
}
