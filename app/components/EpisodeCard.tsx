import Markdown from 'react-native-marked';
import { getCover, getFriendlyDate } from "../utils/helpers";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { Fragment, useRef, useState } from "react";
import Video from 'react-native-video';
import SeekBar from './SeekBar';

interface Props {
  title: string;
  description: string;
  audioUrl: string;
  imageUrl: string;
}

export default function EpisodeCard(
  { title, description, audioUrl, imageUrl  }: any
) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioElement = useRef<Video>(null);

  function seek(time:number, isPlaying=true) {
    time = Math.round(time);
    audioElement.current && audioElement.current.seek(time);
    setCurrentTime(time);
    setIsPlaying(isPlaying);
  }
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
      color: theme.colors.onBackground,
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
    },
    description: {
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

  const isValidMarkdown = description && ! /<(.|\n)*?>/gm.test(description);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Benvenuto su WeBe Radio</Text>
      <Text style={styles.subtitle}>Il fato ha voluto donarti questo podcast:</Text>
      <Image source={{ uri: `${imageUrl}` }} style={{ width: 300, height: 300, backgroundColor: "#6b21a8", borderRadius: 20, alignSelf: 'center' }} />
      <Video
        ref={audioElement}
        source={{ uri: `${audioUrl}` }}
        style={{ width: 0, height: 0 }}
        audioOnly={true}
        paused={!isPlaying}
        onProgress={(e) => {
          setCurrentTime(e.currentTime)
          setDuration(e.seekableDuration)
          //console.log("current time", e.currentTime);
          //console.log("duration", e.seekableDuration);
        }}
        onEnd={() => {
          setIsPlaying(false)
          seek(0, false)
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
        icon={isPlaying ? "pause" : "play"}
      >Play</Button>
      <Text style={styles.titlePodcast} variant='titleMedium'>{title}</Text>
      {isValidMarkdown ?
        <Markdown
          value={description}
          flatListProps={{
            contentContainerStyle: {
              padding: 10,
              marginRight: 0,
              backgroundColor: theme.colors.background,
            },
            alwaysBounceVertical: false,
            showsVerticalScrollIndicator: false,

          }}
        />
        : (<Text style={styles.description} variant='bodyMedium'>{description}</Text>)}

      <View style={{ height: 0, marginTop: 0 }} ></View>
    </View>
  )
}