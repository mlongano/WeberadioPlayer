import Markdown from 'react-native-markdown-display';
import {Image, ScrollView, StyleSheet} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';
import {useRef, useState} from 'react';
import Video from 'react-native-video';
import SeekBar from './SeekBar';
import {EpisodeCardProps} from '@/types';

export default function EpisodeCard({
  title,
  description,
  audioUrl,
  imageUrl,
  cardTitle = 'Benvenuto su WeBe Radio',
  cardSubtitle = 'Il fato ha voluto donarti questo episodio:',
}: EpisodeCardProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioElement = useRef<Video>(null);

  function seek(time: number, isPlaying = true) {
    time = Math.round(time);
    audioElement.current && audioElement.current.seek(time);
    setCurrentTime(time);
    setIsPlaying(isPlaying);
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
        source={{uri: `${imageUrl}`}}
        style={{
          width: 300,
          height: 300,
          backgroundColor: '#6b21a8',
          borderRadius: 20,
          alignSelf: 'center',
        }}
      />
      <Video
        ref={audioElement}
        source={{uri: `${audioUrl}`}}
        style={{width: 0, height: 0}}
        audioOnly={true}
        paused={!isPlaying}
        onProgress={e => {
          setCurrentTime(e.currentTime);
          setDuration(e.seekableDuration);
          //console.log("current time", e.currentTime);
          //console.log("duration", e.seekableDuration);
        }}
        onEnd={() => {
          setIsPlaying(false);
          seek(0, false);
        }}
      />
      <SeekBar
        onSeek={seek}
        trackLength={duration}
        onSlidingStart={() => setIsPlaying(false)}
        currentPosition={currentTime}
        theme={theme}
      />

      <Button
        style={styles.button}
        mode="contained"
        onPress={() => setIsPlaying(!isPlaying)}
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
