import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, ScrollView, View} from 'react-native';
import Video from 'react-native-video';
import {Button, Card, Text, useTheme} from 'react-native-paper';
import Config from 'react-native-config';
import {queryEpisodes, schoolsFetchAllBasic, strapiFetch} from '../api/fetch';
import LoadingSpinner from '../components/LoadingSpinner';
import SeekBar from '../components/SeekBar';

const PodcastsScreen: React.FC = () => {
  const [lastSchoolsEpisode, setLastSchoolsEpisode] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const audioElements = useRef<Video[]>([]);
  const [currentTime, setCurrentTime] = useState<number[]>([]);
  const [duration, setDuration] = useState<number[]>([]);

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

  useEffect(() => {
    const fetchPodcasts = async () => {
      const schools = await schoolsFetchAllBasic();
      try {
        const queriesSchoolsLastEpisode = schools.map((school: any) => {
          return {
            school: school.attributes,
            query: {
              sort: 'date:desc',
              filters: {
                schools: {
                  slug: {
                    $eq: school.attributes.slug,
                  },
                },
              },
              ...queryEpisodes,
            },
          };
        });

        const schoolsLastEpisode = await Promise.all(
          queriesSchoolsLastEpisode.map(async (querySchool: any) => {
            try {
              const episode = await strapiFetch(
                '/api/episodes',
                querySchool.query,
                false,
                1,
              );
              return {
                school: querySchool.school,
                episode: episode?.data[0],
              };
            } catch (e) {
              return {
                school: querySchool.school,
                episode: null,
              };
            }
          }),
        );

        const episodes = schoolsLastEpisode.filter(
          (episode: any) => episode.episode !== null,
        );
        // Sort episodes by date desc
        episodes.sort((a: any, b: any) => {
          if (a.episode?.attributes.date > b.episode?.attributes.date) {
            return -1;
          }
          if (a.episode?.attributes.date < b.episode?.attributes.date) {
            return 1;
          }
          return 0;
        });

        setCurrentTime(episodes.map(() => 0));
        setDuration(episodes.map(() => 1));

        setLastSchoolsEpisode(episodes);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPodcasts();
  }, []);

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

  if (loading) {
    return <LoadingSpinner />;
  }
  //console.log('playingIndex: ', playingIndex);
  return (
    <ScrollView style={styles.container}>
      {lastSchoolsEpisode.map((item, index) => {
        const episode = item?.episode?.attributes;
        const school = item?.school;
        const coverImageUrl =
          Config.STRAPI_URL_BASE + episode?.cover?.data?.attributes?.url;
        const audioUrl =
          Config.STRAPI_URL_BASE + episode?.audio?.data?.attributes?.url;
        const isPlaying = index === playingIndex;
        //console.log('isPlaying: ', index, isPlaying);
        return (
          <Card key={school.slug} style={styles.card}>
            <Card.Cover source={{uri: coverImageUrl}} />
            <Card.Content>
              <Text variant="headlineSmall">{school.short_name}</Text>
              <Text variant="titleMedium">{episode.title}</Text>
              <Text variant="bodyMedium">{episode.description}</Text>
              <Video
                ref={(ref: any) => {
                  audioElements.current[index] = ref;
                }}
                audioOnly={true}
                source={{uri: audioUrl}}
                style={styles.audioPlayer}
                paused={!isPlaying}
                onProgress={e => {
                  setCurrentTime(prev => {
                    const newCurrentTime = [...prev];
                    newCurrentTime[index] = e.currentTime;
                    return newCurrentTime;
                  });
                  setDuration(prev => {
                    const newDuration = [...prev];
                    newDuration[index] = e.seekableDuration;
                    return newDuration;
                  });
                }}
                onEnd={() => {
                  setPlayingIndex(-1);
                  seek(index, 0);
                }}
              />
              <SeekBar
                onSeek={onSeeking(index)}
                trackLength={duration[index]}
                onSlidingStart={() => setPlaying(index, true)}
                currentPosition={currentTime[index]}
                theme={theme}
              />
            </Card.Content>
            <Card.Actions>
              <Button
                icon={isPlaying ? 'stop' : 'play'}
                mode="elevated"
                onPress={() => handlePlay(index)}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}>
                Play
              </Button>
            </Card.Actions>
          </Card>
        );
      })}
    </ScrollView>
  );
};

export default PodcastsScreen;
