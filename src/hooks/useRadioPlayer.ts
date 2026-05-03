import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { audioManager } from '../services/AudioManager';

export function useRadioPlayer() {
  const state = useSyncExternalStore(audioManager.subscribe, audioManager.getSnapshot);

  const playRadio = useCallback(
    (source: Parameters<typeof audioManager.playRadio>[0]) => audioManager.playRadio(source),
    [],
  );
  const playPodcast = useCallback(
    (source: Parameters<typeof audioManager.playPodcast>[0]) => audioManager.playPodcast(source),
    [],
  );
  const stop = useCallback(() => audioManager.stop(), []);
  const togglePlay = useCallback(() => audioManager.togglePlay(), []);
  const setVolume = useCallback((vol: number) => audioManager.setVolume(vol), []);

  return useMemo(() => ({
    ...state,
    playRadio,
    playPodcast,
    stop,
    togglePlay,
    setVolume,
  }), [state, playRadio, playPodcast, stop, togglePlay, setVolume]);
}
