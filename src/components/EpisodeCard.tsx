import { useMemo } from 'react';
import Markdown from 'react-native-markdown-display';
import { Image, ScrollView, StyleSheet, Platform } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import SeekBar from './SeekBar';
import { EpisodeCardProps } from '@/types';
import { audioManager, AudioSource } from '@/src/services/AudioManager';
import { useRadioPlayer } from '@/src/hooks/useRadioPlayer';
import TrackPlayer, { useProgress } from 'react-native-track-player';

export default function EpisodeCard({
  title,
  description,
  audioUrl,
  imageUrl,
  cardTitle = 'Benvenuto su WeBe Radio',
  cardSubtitle = 'Il fato ha voluto donarti questo episodio:',
}: EpisodeCardProps) {
  const { currentSource, isPlaying: isPlayerPlaying, playPodcast, stop } = useRadioPlayer();
  const isPlaying = isPlayerPlaying && currentSource?.url === audioUrl;

  // TrackPlayer progress for Android
  const { position, duration } = Platform.OS === 'android' ? useProgress() : { position: 0, duration: 1 };

  // iOS progress from AudioManager (via HiddenAudioPlayer's central Video)
  const iosState = Platform.OS === 'ios' ? audioManager.getSnapshot() : null;

  function seek(time: number) {
    if (Platform.OS === 'android') {
      try {
        TrackPlayer.seekTo(time);
      } catch (error) {
        if (__DEV__) console.log('Error seeking on Android:', error);
      }
    } else {
      audioManager.seekVideoOnIOS(time);
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
      await stop();
    } else {
      await playPodcast(episodeSource);
    }
  }

  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
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
  }), [theme.colors.background, theme.colors.onBackground]);

  const markdownStyle = useMemo(() => ({
    body: {
      backgroundColor: theme.colors.background,
      color: theme.colors.onBackground,
      fontSize: 12,
      marginBottom: 20,
    },
  }), [theme.colors.background, theme.colors.onBackground]);

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
      <SeekBar
        onSeek={seek}
        trackLength={Platform.OS === 'android' ? duration : (iosState?.duration ?? 0)}
        onSlidingStart={() => {}}
        currentPosition={Platform.OS === 'android' ? position : (iosState?.currentTime ?? 0)}
        theme={theme}
      />

      <Button
        style={styles.button}
        mode="contained"
        onPress={togglePlayback}
        icon={isPlaying ? 'pause' : 'play'}
        accessibilityLabel={isPlaying ? `Metti in pausa ${title}` : `Riproduci ${title}`}
      >
        Play
      </Button>
      <Text style={styles.titlePodcast} variant="titleMedium">
        {title}
      </Text>
      <Markdown style={markdownStyle}>
        {description ?? ''}
      </Markdown>
    </ScrollView>
  );
}
