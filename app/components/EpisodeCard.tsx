import Markdown from 'react-native-markdown-display';
import { Image, ScrollView, StyleSheet, Platform } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useRef, useState, useEffect } from 'react';
import Video, { VideoRef } from 'react-native-video';
import SeekBar from './SeekBar';
import { EpisodeCardProps } from '@/types';
import { audioManager, AudioSource } from '../../src/services/AudioManager';
import TrackPlayer, { useProgress } from 'react-native-track-player';

export default function EpisodeCard({
  title,
  description,
  audioUrl,
  imageUrl,
  cardTitle = 'Benvenuto su WeBe Radio',
  cardSubtitle = 'Il fato ha voluto donarti questo episodio:',
}: EpisodeCardProps) {
  const [currentSource, setCurrentSource] = useState<AudioSource | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Listen for audio source changes
  useEffect(() => {
    const unsubscribe = audioManager.onSourceChange((source) => {
      setCurrentSource(source);
      // Check if this episode is currently playing
      const isThisEpisodePlaying = source && source.url === audioUrl;
      setIsPlaying(!!isThisEpisodePlaying);
    });
    return unsubscribe;
  }, [audioUrl]);

  // TrackPlayer progress for Android
  const { position, duration } = Platform.OS === 'android' ? useProgress() : { position: 0, duration: 1 };

  // Video progress for iOS
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const audioElement = useRef<VideoRef>(null);

  // Register Video ref with AudioManager for iOS
  useEffect(() => {
    if (Platform.OS === 'ios') {
      audioManager.registerVideoRef(`episode-${title}`, audioElement.current);
    }
    return () => {
      if (Platform.OS === 'ios') {
        audioManager.unregisterVideoRef(`episode-${title}`);
      }
    };
  }, [title]);

  function seek(time: number, isPlaying = true) {
    if (Platform.OS === 'android') {
      TrackPlayer.seekTo(time);
    } else {
      // iOS: Use AudioManager to seek
      audioManager.seekVideoOnIOS(time);
      setCurrentTime(time);
    }
  }

  async function togglePlayback() {
    const episodeSource: AudioSource = {
      id: `episode-${title}`,
      url: audioUrl,
      title: title,
      artist: cardTitle,
      artwork: imageUrl,
      type: 'episode',
      isLiveStream: false,
    };

    if (isPlaying) {
      await audioManager.stop();
    } else {
      await audioManager.playPodcast(episodeSource);
    }
  }
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 10,
      paddingBottom: 10,
      backgroundColor: theme.colors.background,
      color: theme.colors.onBackground,
      marginBottom: 0,
    },
    image: {
      width: '100%',
      height: 400,
      borderRadius: 20,
      resizeMode: 'cover',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    titlePodcast: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      marginBottom: 20,
      fontStyle: 'italic',
    },
    button: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 20,
      marginTop: 10,
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 30,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{cardTitle}</Text>
      <Text style={styles.subtitle}>{cardSubtitle}</Text>
      <Image
        source={{ uri: `${imageUrl}` }}
        style={{
          width: 300,
          height: 300,
          backgroundColor: '#6b21a8',
          borderRadius: 20,
          alignSelf: 'center',
        }}
      />
      {Platform.OS === 'ios' && (
        <Video
          ref={audioElement}
          source={{
            uri: `${audioUrl}`,
            headers: {
              'User-Agent': 'WeBeRadioApp/1.0',
              'Accept': '*/*',
            }
          }}
          style={{ width: 0, height: 0 }}
          paused={!isPlaying}
          playInBackground={true}
          playWhenInactive={true}
          disableFocus={true}
          resizeMode="cover"
          controls={false}
          muted={false}
          volume={1.0}
          rate={1.0}
          onError={(error) => {
            console.log('iOS EpisodeCard Video Error:', error);
          }}
          onLoadStart={() => {
            console.log('iOS EpisodeCard Load Start');
          }}
          onLoad={() => {
            console.log('iOS EpisodeCard Loaded');
          }}
          onEnd={() => {
            audioManager.stop();
          }}
        />
      )}
      <SeekBar
        onSeek={seek}
        trackLength={Platform.OS === 'android' ? duration : videoDuration}
        onSlidingStart={() => {
          // Pause during seeking on both platforms
          if (isPlaying) {
            audioManager.stop();
          }
        }}
        currentPosition={Platform.OS === 'android' ? position : currentTime}
        theme={theme}
      />

      <Button
        style={styles.button}
        mode="contained"
        onPress={togglePlayback}
        icon={isPlaying ? 'pause' : 'play'}>
        Play
      </Button>
      <Text style={styles.titlePodcast} variant="titleMedium">
        {title}
      </Text>
      <Markdown
        style={{
          body: {
            backgroundColor: theme.colors.background,
            color: theme.colors.onBackground,
            fontSize: 12,
            marginBottom: 20,
          },
        }}>
        {description ?? ''}
      </Markdown>
    </ScrollView>
  );
}
