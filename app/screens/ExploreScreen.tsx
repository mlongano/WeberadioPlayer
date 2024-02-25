import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Image,
} from 'react-native';
import {
  Text,
  useTheme,
  Card,
  Searchbar,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import {episodesFetchAll, queryEpisodes} from '../api/fetch';
import Config from 'react-native-config';
import Fuse from 'fuse.js';
import Video from 'react-native-video';
import LoadingSpinner from '../components/LoadingSpinner';
import SeekBar from '../components/SeekBar';
import {useNavigation} from '@react-navigation/native';

const ExploreScreen: React.FC = () => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [playingIndex, setPlayingIndex] = useState(-1);
  const audioElements = useRef<Video[]>([]);
  const [currentTime, setCurrentTime] = useState<number[]>([]);
  const [duration, setDuration] = useState<number[]>([]);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = {
          sort: 'date:desc',
          ...queryEpisodes,
        };
        const episodes = await episodesFetchAll(query);
        setEpisodes(episodes);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPosts();
    setLoading(false);
  }, []);

  function seek(index: number, time: number, isPlaying = true) {
    time = Math.round(time);
    audioElements.current[index] && audioElements.current[index].seek(time);
    const newCurrentTime = [...currentTime];
    newCurrentTime[index] = time;
    setCurrentTime(newCurrentTime);
    setPlaying(index, isPlaying);
  }

  function onSeeking(index: number) {
    return (time: number) => {
      seek(index, time, true);
    };
  }

  const setPlaying = (index: number, isPlaying: boolean) => {
    if (playingIndex === index && !isPlaying) {
      setPlayingIndex(-1);
    } else {
      setPlayingIndex(index);
    }
  };

  const handlePlay = (index: number) => {
    if (playingIndex !== -1 && playingIndex !== index) {
      setPlayingIndex(index);
    } else if (playingIndex !== -1) {
      setPlayingIndex(-1);
    } else {
      setPlayingIndex(index);
    }
  };
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 10,
    },
    coverImage: {
      width: 80,
      height: 80,
      marginRight: 20,
      borderRadius: 10,
    },
    itemContent: {
      flex: 1,
    },
    itemTitle: {
      color: theme.colors.onBackground,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    itemDescription: {
      fontSize: 14,
      color: theme.colors.onBackground,
      marginBottom: 10,
    },
    itemButton: {
      width: 80,
    },
    audioPlayerButton: {
      marginLeft: 10,
      width: 80,
    },
    audioPlayer: {
      width: 0,
      height: 0,
      marginBottom: 0,
    },
    card: {
      marginBottom: 20,
    },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const options = {
    includeScore: true,
    keys: [
      'attributes.title',
      'attributes.slug',
      'attributes.description',
      'attributes.date',
      'attributes.tags.data.attributes.name',
      'attributes.podcast.data.attributes.tags.data.attributes.name',
      'attributes.podcast.data.attributes.title',
      'attributes.podcast.data.attributes.slug',
      'attributes.podcast.data.attributes.description',
      'attributes.podcast.data.attributes.schools.data.attributes.name',
      'attributes.podcast.data.attributes.schools.data.attributes.short_name',
      'attributes.podcast.data.attributes.schools.data.attributes.slug',
      'attributes.schools.data.attributes.name',
      'attributes.schools.data.attributes.short_name',
      'attributes.schools.data.attributes.slug',
    ],
    threshold: 0,
    includeMatches: true,
    ignoreLocation: true,
    useExtendedSearch: true,
    findAllMatches: true,
  };

  const fuse = new Fuse(episodes, options);
  const fusePosts =
    searchQuery.length > 0
      ? fuse.search(searchQuery).map((result: any) => result.item)
      : episodes;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView>
      <View style={{marginBottom: 20}} />
      <Searchbar
        style={{margin: 10}}
        value={searchQuery}
        onChangeText={text => setSearchQuery(text)}
        icon="magnify"
        placeholder="Cerca..."
      />

      <View>
        {fusePosts?.length > 0 ? (
          fusePosts.map((episode: any, index) => {
            const coverImageUrl =
              Config.STRAPI_URL_BASE +
              episode?.attributes?.cover?.data?.attributes?.url;
            const audioUrl =
              Config.STRAPI_URL_BASE +
              episode?.attributes?.audio?.data?.attributes?.url;
            //console.log("episode:", JSON.stringify(episode, null, 2));
            const isPlaying = index === playingIndex;

            return (
              <Card key={episode.id} style={{margin: 10}} onPress={() => {}}>
                <Card.Cover source={{uri: coverImageUrl}} />
                <Card.Content>
                  <Text variant="headlineSmall">
                    {episode.attributes.title}
                  </Text>
                  <Text variant="bodySmall">
                    {episode.attributes.description}
                  </Text>
                  <Text variant="bodySmall">{episode.attributes.date}</Text>
                </Card.Content>
                <Card.Actions>
                  <Button
                    icon={isPlaying ? 'stop' : 'play'}
                    mode="elevated"
                    onPress={() =>
                      navigation.navigate('EpisodeCard', {episode})
                    }
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.onPrimary}>
                    Play
                  </Button>
                </Card.Actions>
              </Card>
            );
          })
        ) : (
          <View>
            <Text>Nessuna notizia trovata</Text>
            <Image
              source={require('../assets/undraw_page_not_found_su7k.png')}
              style={{resizeMode: 'contain', width: '100%', height: '100%'}}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ExploreScreen;
