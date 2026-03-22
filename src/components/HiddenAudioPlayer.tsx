import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { audioManager } from '@/src/services/AudioManager';
import { icecastMetadataService } from '@/src/services/IcecastMetadataService';
import { useRadioPlayer } from '@/src/hooks/useRadioPlayer';

export default function HiddenAudioPlayer() {
  const videoRef = useRef<VideoRef>(null);
  const { currentSource, volume } = useRadioPlayer();

  useEffect(() => {
    if (currentSource) {
      audioManager.registerVideoRef(currentSource.id, videoRef.current);
    }
    return () => {
      if (currentSource) {
        audioManager.unregisterVideoRef(currentSource.id);
      }
    };
  }, [currentSource?.id]);

  if (Platform.OS !== 'ios' || !currentSource) {
    return null;
  }

  interface MetadataItem {
    identifier?: string;
    key?: string;
    value?: string;
  }

  interface TimedMetadataEvent {
    metadata?: MetadataItem[];
  }

  const handleTimedMetadata = async (metadata: TimedMetadataEvent) => {
    // Extract StreamTitle from timed metadata
    let rawTitle = '';

    if (metadata && metadata.metadata && Array.isArray(metadata.metadata)) {
      const streamTitleItem = metadata.metadata.find((item: MetadataItem) =>
        item.identifier === 'icy/StreamTitle' ||
        item.identifier === 'StreamTitle' ||
        item.key === 'StreamTitle'
      );

      if (streamTitleItem) {
        rawTitle = streamTitleItem.value || '';
      }
    }

    if (rawTitle && rawTitle !== 'WeBe Radio') {
      await icecastMetadataService.processIcyMetadata(rawTitle);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{
          uri: currentSource.url,
          headers: {
            'User-Agent': 'WeBeRadioApp/1.0',
            'Accept': '*/*',
            'Icy-MetaData': '1',
          },
          type: 'mp3',
        }}
        style={styles.audioElement}
        paused={!audioManager.getSnapshot().isPlaying} // We read directly to avoid lag, or use prop?
        // Actually, the AudioManager controls play/pause via ref methods (resume/pause)
        // But we also need to respect the initial prop state or updates.
        // However, AudioManager.playVideoOnIOS calls resume(), which overrides 'paused' prop?
        // react-native-video behavior: 'paused' prop is authoritative.
        // If AudioManager calls resume(), it might not update the prop here if we don't pass it.
        // But AudioManager manages the "active" video.
        // Let's rely on AudioManager calling resume/pause on the ref,
        // BUT we should also pass the correct 'paused' prop to be safe and declarative.
        // If isPlaying is true AND this is the active source, it should be playing.
        // But AudioManager handles multiple sources potentially (though we only render one Video here usually? No, we might render multiple if we had a list, but here we only render the current one).
        // Wait, if we only render ONE Video component for the current source, then we don't need a map of refs in AudioManager?
        // The original code rendered ONE Video component for 'webeRadioStream'.
        // But now we want to support podcasts too on iOS.
        // So we should render a Video component for the *currentSource*.
        // If currentSource changes, the Video component updates its source.
        // So we only need ONE ref.
        // AudioManager logic `videoRefs.get(source.id)` implies multiple videos could exist?
        // In the original code, there was only one Video.
        // My refactor of AudioManager assumes we might register multiple refs.
        // But if I only render one HiddenAudioPlayer, I only have one ref.
        // So I should register it with the ID of the current source.

        playInBackground={true}
        playWhenInactive={true}
        ignoreSilentSwitch="ignore"
        disableFocus={true}
        resizeMode="cover"
        controls={false}
        muted={false}
        volume={volume}
        rate={1.0}
        bufferConfig={{
          minBufferMs: 15000,
          maxBufferMs: 50000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 5000,
        }}
        onTimedMetadata={handleTimedMetadata}
        onError={(e) => console.log('Video Error:', e)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 0,
    width: 0,
    opacity: 0,
  },
  audioElement: {
    height: 0,
    width: 0,
  },
});
