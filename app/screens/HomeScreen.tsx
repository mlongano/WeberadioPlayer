import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { episodesFetchAll, heroImageFetch, queryEpisodes, schoolsFetchAllBasic, strapiFetch } from '../api/fetch';
import Config from 'react-native-config';
import Video from 'react-native-video';
import { Button, Text, useTheme } from 'react-native-paper';
import Markdown from 'react-native-marked';
import SeekBar from '../components/SeekBar';
import LoadingSpinner from '../components/LoadingSpinner';


const HomeScreen: React.FC = () => {
  const [episode, setEpisode] = useState<any>({});
  const [heroImage, setHeroImage] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    const fetchHomeScreenInfo = async () => {
      try {
        const query = {
          sort: "date:desc",
          ...queryEpisodes
        };
        const episodes = await episodesFetchAll(query);

        const heroImage = await heroImageFetch("home_page");

        const schools = await schoolsFetchAllBasic();

        const { data: { attributes: { home_page_text: homePageText } } } = await strapiFetch("/api/about-us", { fields: ["home_page_text"] });

        const numberOfEpisodes = episodes?.length;
        const selectedEpisode = Math.floor(Math.random() * numberOfEpisodes);
        let episode = episodes[selectedEpisode]?.attributes;
        while (!episode?.audio?.data?.attributes?.url) {
          const selectedEpisode = Math.floor(Math.random() * numberOfEpisodes);
          episode = episodes[selectedEpisode]?.attributes;
        }
        setEpisode(episode);
        setHeroImage(heroImage);
        setLoading(false);
        //console.log("episode:", episode.audio.data.attributes.url);
        //console.log("schools", schools);
        //console.log("strapiUrlBase", strapiUrlBase);
        //console.log("heroImage", heroImage);
        //console.log("homePageText", homePageText);


      } catch (error) {
        console.error(error);
      }
    };

    fetchHomeScreenInfo();
  }, []);

  const audioUrl = `${Config.STRAPI_URL_BASE}${episode?.audio?.data?.attributes?.url}`;
  const imageUrl = `${Config.STRAPI_URL_BASE}${episode?.cover?.data?.attributes?.url}`;
  //console.log("audioUrl", audioUrl);
  //console.log("imageUrl", imageUrl);
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

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  const isValidMarkdown = episode?.description && ! /<(.|\n)*?>/gm.test(episode?.description);
  //console.log("current time", currentTime);
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
      <Text style={styles.titlePodcast} variant='titleMedium'>{episode?.title}</Text>
      {isValidMarkdown ?
        <Markdown
          value={episode?.description}
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
        : (<Text style={styles.description} variant='bodyMedium'>{episode?.description}</Text>)}

      <View style={{ height: 0, marginTop: 0 }} ></View>
    </View>
  );
};


export default HomeScreen;
