import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import Video from 'react-native-video';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import Config from "react-native-config";
import { queryEpisodes, schoolsFetchAllBasic, strapiFetch } from '../api/fetch';

const PodcastsScreen: React.FC = () => {
  const [lastSchoolsEpisode, setLastSchoolsEpisode] = useState<any[]>([]);
  const [playing, setPlaying] = useState<boolean[]>([]);
  const videoRef = useRef<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);


  useEffect(() => {
    const fetchPodcasts = async () => {
      const schools = await schoolsFetchAllBasic();
      try {
        const queriesSchoolsLastEpisode = schools.map((school: any) => {
          return {
            school: school.attributes,
            query: {
              sort: "date:desc",
              filters: {
                schools: {
                  slug: {
                    $eq: school.attributes.slug
                  }
                }
              },
              ...queryEpisodes,
            }
          }
        });

        const schoolsLastEpisode = await Promise.all(queriesSchoolsLastEpisode.map(async (querySchool: any) => {
          try {
            const episode = await strapiFetch(`/api/episodes`, querySchool.query, false, 1);
            return {
              school: querySchool.school,
              episode: episode?.data[0]
            }
          } catch (e) {
            return {
              school: querySchool.school,
              episode: null
            }
          }
        }));

        const episodes = schoolsLastEpisode.filter((episode: any) => episode.episode !== null);
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

        setPlaying(episodes.map(() => false)); // add a playing state to the playing array

        setLastSchoolsEpisode(episodes);

      } catch (error) {
        console.error(error);
      }
    };

    fetchPodcasts();
  }, []);

  const handlePlay = (index: number) => {
    // Pause all other episodes
    const newPlaying: boolean[] = playing.map((item: any, i: number) => {
      if (i !== index) {
        item = false;
      }
      return item;
    });

    // Toggle the playing state of the current episode
    newPlaying[index] = !newPlaying[index];
    playing[index] = !playing[index];
    //setPlaying(newPlaying);
    if (currentIndex !== -1) {
      setCurrentIndex(-1);
    } else {
      setCurrentIndex(index);
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


  return (
    <ScrollView style={styles.container}>
      {lastSchoolsEpisode.map((item, index) => {
        const episode = item?.episode?.attributes;
        const school = item?.school;
        const coverImageUrl = Config.STRAPI_URL_BASE + episode?.cover?.data?.attributes?.url;
        const audioUrl = Config.STRAPI_URL_BASE + episode?.audio?.data?.attributes?.url;
        return (
          <Card key={school.slug} style={styles.card}>
            <Card.Cover source={{ uri: coverImageUrl }} />
            <Card.Content>
              <Text variant='headlineSmall'>{school.short_name}</Text>
              <Text variant='titleMedium'>{episode.title}</Text>
              <Text variant='bodyMedium'>{episode.description}</Text>
              <Video
                ref={(ref: Video) => videoRef.current[index] = ref}
                audioOnly={true}
                source={{ uri: audioUrl }}
                style={styles.audioPlayer}
                paused={currentIndex !== index}
              />

            </Card.Content>
            <Card.Actions>
              <Button icon={playing[index] ? 'stop' : 'play'} mode='elevated' onPress={() => handlePlay(index)} buttonColor={theme.colors.primary} textColor={theme.colors.onPrimary}>
                Play
              </Button>
            </Card.Actions>
          </Card>
        )
      })}
    </ScrollView>
  );
};


export default PodcastsScreen;
