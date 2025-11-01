import TrackPlayer, { Track } from 'react-native-track-player';
import { Platform } from 'react-native';
import Video, { VideoRef } from 'react-native-video';

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
  private videoRefs: Map<string, VideoRef | null> = new Map();
  private activeVideoId: string | null = null;

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
    } else {
      // iOS: Use Video component
      this.playVideoOnIOS(source);
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
    } else {
      // iOS: Use Video component
      this.playVideoOnIOS(source);
    }

    this.currentSource = source;
    this.notifyListeners();
  }

  // Stop playback
  async stop() {
    if (Platform.OS === 'android') {
      await TrackPlayer.reset();
    } else {
      // iOS: Pause video
      this.pauseVideoOnIOS();
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
    // For iOS, check if we have an active video
    return this.activeVideoId !== null;
  }

  // Register a Video component ref for iOS playback
  registerVideoRef(id: string, ref: VideoRef | null) {
    this.videoRefs.set(id, ref);
  }

  // Unregister a Video component ref
  unregisterVideoRef(id: string) {
    this.videoRefs.delete(id);
    if (this.activeVideoId === id) {
      this.activeVideoId = null;
    }
  }

  // Play video on iOS
  private playVideoOnIOS(source: AudioSource) {
    if (Platform.OS === 'ios') {
      // Stop any currently playing video
      if (this.activeVideoId) {
        const currentRef = this.videoRefs.get(this.activeVideoId);
        if (currentRef) {
          currentRef.pause();
        }
      }

      // Find and play the video for this source
      const videoRef = this.videoRefs.get(source.id);
      if (videoRef) {
        this.activeVideoId = source.id;
        videoRef.resume();
      }
    }
  }

  // Pause video on iOS
  private pauseVideoOnIOS() {
    if (Platform.OS === 'ios' && this.activeVideoId) {
      const videoRef = this.videoRefs.get(this.activeVideoId);
      if (videoRef) {
        videoRef.pause();
      }
      this.activeVideoId = null;
    }
  }

  // Seek video on iOS
  seekVideoOnIOS(time: number) {
    if (Platform.OS === 'ios' && this.activeVideoId) {
      const videoRef = this.videoRefs.get(this.activeVideoId);
      if (videoRef) {
        videoRef.seek(time);
      }
    }
  }
}

export const audioManager = new AudioManager();