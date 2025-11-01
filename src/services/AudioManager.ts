import TrackPlayer, { Track } from 'react-native-track-player';
import { Platform } from 'react-native';

export interface AudioSource {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  type: 'radio' | 'podcast' | 'episode';
  metadata?: any;
  isLiveStream?: boolean;
}

class AudioManager {
  private currentSource: AudioSource | null = null;
  private listeners: ((source: AudioSource | null) => void)[] = [];

  // Subscribe to source changes
  onSourceChange(callback: (source: AudioSource | null) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of source change
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentSource));
  }

  // Convert AudioSource to TrackPlayer Track
  private audioSourceToTrack(source: AudioSource): Track {
    return {
      id: source.id,
      url: source.url,
      title: source.title,
      artist: source.artist,
      artwork: source.artwork,
      isLiveStream: source.isLiveStream || false,
    };
  }

  // Play radio stream
  async playRadio(source: AudioSource) {
    if (Platform.OS === 'android') {
      await TrackPlayer.reset();
      await TrackPlayer.add([this.audioSourceToTrack(source)]);
      await TrackPlayer.play();
    }

    this.currentSource = source;
    this.notifyListeners();
  }

  // Play podcast episode
  async playPodcast(source: AudioSource) {
    if (Platform.OS === 'android') {
      await TrackPlayer.reset();
      await TrackPlayer.add([this.audioSourceToTrack(source)]);
      await TrackPlayer.play();
    }

    this.currentSource = source;
    this.notifyListeners();
  }

  // Stop playback
  async stop() {
    if (Platform.OS === 'android') {
      await TrackPlayer.reset();
    }

    this.currentSource = null;
    this.notifyListeners();
  }

  // Get current source
  getCurrentSource(): AudioSource | null {
    return this.currentSource;
  }

  // Check if playing
  async isPlaying(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const state = await TrackPlayer.getPlaybackState();
      return state.state === 'playing';
    }
    return false;
  }
}

export const audioManager = new AudioManager();