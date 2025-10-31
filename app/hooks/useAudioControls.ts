// hooks/useAudioControls.ts
import { useState } from 'react';
import { clamp } from '../../src/utils/helpers';
import TrackPlayer from 'react-native-track-player';

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
    TrackPlayer.setVolume(nextVolume);
  }

  function changeVolumeBy(delta: number) {
    const nextVolume = clamp(0, volume + delta, 1);
    setVolume(nextVolume);
    TrackPlayer.setVolume(nextVolume);
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
    const currentVolume = await TrackPlayer.getVolume();
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
    TrackPlayer.setVolume(nextVolume);
  }

  return { isPlaying, volume, togglePlay, changeVolume, toggleMute, volumeDown, volumeUp };
}
