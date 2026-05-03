import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { audioManager } from '@/src/services/AudioManager';
import { icecastMetadataService } from '@/src/services/IcecastMetadataService';
import { useRadioPlayer } from '@/src/hooks/useRadioPlayer';

export default function HiddenAudioPlayer() {
  const videoRef = useRef<VideoRef>(null);
  const { currentSource, isPlaying, volume } = useRadioPlayer();

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
        paused={!isPlaying}

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
        onProgress={(data) => audioManager.updateProgress(data.currentTime, data.seekableDuration)}
        onLoad={(data) => audioManager.updateProgress(0, data.duration)}
        onEnd={() => audioManager.onEnd()}
        onError={(e) => {
          if (__DEV__) console.log('Video Error:', e);
        }}
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
