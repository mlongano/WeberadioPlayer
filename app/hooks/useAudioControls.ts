// hooks/useAudioControls.ts
import { useRef, useState } from 'react';
import { clamp } from '../utils/helpers';

export default function useAudioControls() {
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

  return { isPlaying, volume, audioPlayer, togglePlay, changeVolume, toggleMute, volumeDown, volumeUp };
}
