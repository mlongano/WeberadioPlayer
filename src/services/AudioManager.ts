import TrackPlayer, { Track, State, Event } from 'react-native-track-player';
import { Platform } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { Config } from '../utils/config';

export interface AudioSource {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  type: 'radio' | 'podcast' | 'episode';
  metadata?: Record<string, string>;
  isLiveStream?: boolean;
}

export interface AudioState {
  isPlaying: boolean;
  currentSource: AudioSource | null;
  volume: number;
  isBuffering: boolean;
}

class AudioManager {
  private state: AudioState = {
    isPlaying: false,
    currentSource: null,
    volume: 0.5,
    isBuffering: false,
  };

  private listeners: Set<() => void> = new Set();
  private videoRefs: Map<string, VideoRef | null> = new Map();
  private activeVideoId: string | null = null;

  constructor() {
    this.setupTrackPlayerListeners();
  }

  private setupTrackPlayerListeners() {
    if (Platform.OS === 'android') {
      TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
        const isPlaying = event.state === State.Playing;
        const isBuffering = event.state === State.Buffering;

        if (this.state.isPlaying !== isPlaying || this.state.isBuffering !== isBuffering) {
          this.state = { ...this.state, isPlaying, isBuffering };
          this.emitChange();
        }
      });
    }
  }

  // --- Store API (useSyncExternalStore) ---

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.state;
  };

  private emitChange() {
    this.listeners.forEach((listener) => listener());
  }

  // --- Playback Control ---

  async playRadio(source: AudioSource) {
    if (this.state.currentSource?.id === source.id && this.state.isPlaying) return;
    this.state = { ...this.state, currentSource: source, isPlaying: true };
    this.emitChange();

    if (Platform.OS === 'android') {
      await TrackPlayer.reset();
      await TrackPlayer.add([this.audioSourceToTrack(source)]);
      await TrackPlayer.play();
    } else {
      this.playVideoOnIOS(source);
    }
  }

  async playPodcast(source: AudioSource) {
    if (this.state.currentSource?.id === source.id && this.state.isPlaying) return;
    this.state = { ...this.state, currentSource: source, isPlaying: true };
    this.emitChange();

    if (Platform.OS === 'android') {
      await TrackPlayer.reset();
      await TrackPlayer.add([this.audioSourceToTrack(source)]);
      await TrackPlayer.play();
    } else {
      this.playVideoOnIOS(source);
    }
  }

  async stop() {
    if (!this.state.isPlaying) return;
    this.state = { ...this.state, isPlaying: false };
    this.emitChange();

    if (Platform.OS === 'android') {
      await TrackPlayer.reset();
    } else {
      this.pauseVideoOnIOS();
    }
  }

  async togglePlay() {
    if (this.state.isPlaying) {
      await this.stop();
    } else if (this.state.currentSource) {
      if (this.state.currentSource.type === 'radio') {
        await this.playRadio(this.state.currentSource);
      } else {
        await this.playPodcast(this.state.currentSource);
      }
    }
  }

  // --- Volume Control ---

  async setVolume(volume: number) {
    this.state = { ...this.state, volume };
    this.emitChange();

    if (Platform.OS === 'android') {
      try {
        await TrackPlayer.setVolume(volume);
      } catch (error) {
        console.log('Error setting TrackPlayer volume:', error);
      }
    }
    // iOS Video component reads volume from state prop
  }

  getVolume(): number {
    return this.state.volume;
  }

  // --- iOS Video Handling ---

  registerVideoRef(id: string, ref: VideoRef | null) {
    this.videoRefs.set(id, ref);
    if (ref && this.state.currentSource?.id === id) {
      this.activeVideoId = id;
      if (this.state.isPlaying) {
        ref.resume();
      }
    }
  }

  unregisterVideoRef(id: string) {
    this.videoRefs.delete(id);
    if (this.activeVideoId === id) {
      this.activeVideoId = null;
    }
  }

  private playVideoOnIOS(source: AudioSource) {
    if (Platform.OS !== 'ios') return;
    // Pause any previously active video
    const prevId = this.activeVideoId || (this.state.currentSource?.id !== source.id ? this.state.currentSource?.id : undefined);
    if (prevId && prevId !== source.id) {
      this.videoRefs.get(prevId)?.pause();
    }

    const videoRef = this.videoRefs.get(source.id);
    if (videoRef) {
      this.activeVideoId = source.id;
      videoRef.resume();
    }
  }

  private pauseVideoOnIOS() {
    if (Platform.OS !== 'ios') return;
    const id = this.activeVideoId || this.state.currentSource?.id;
    if (id) {
      const videoRef = this.videoRefs.get(id);
      videoRef?.pause();
    }
  }

  seekVideoOnIOS(time: number) {
    if (Platform.OS === 'ios' && this.activeVideoId) {
      const videoRef = this.videoRefs.get(this.activeVideoId);
      videoRef?.seek(time);
    }
  }

  // --- Helpers ---

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
}

export const audioManager = new AudioManager();