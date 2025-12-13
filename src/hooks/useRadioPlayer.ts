import { useSyncExternalStore } from 'react';
import { audioManager } from '../services/AudioManager';

export function useRadioPlayer() {
  const state = useSyncExternalStore(audioManager.subscribe, audioManager.getSnapshot);

  return {
    ...state,
    playRadio: audioManager.playRadio.bind(audioManager),
    playPodcast: audioManager.playPodcast.bind(audioManager),
    stop: audioManager.stop.bind(audioManager),
    togglePlay: audioManager.togglePlay.bind(audioManager),
    setVolume: audioManager.setVolume.bind(audioManager),
  };
}
