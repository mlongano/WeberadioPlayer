import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Platform } from 'react-native';
import Video from 'react-native-video';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { Config } from '../../src/utils/config';
import { queryEpisodes, schoolsFetchAllBasic, strapiFetch } from '../../src/api/fetch';
import LoadingSpinner from '../components/LoadingSpinner';
import SeekBar from '../components/SeekBar';
import Markdown from 'react-native-markdown-display';
import TrackPlayer, { State, usePlaybackState, useProgress } from 'react-native-track-player';
import { audioManager, AudioSource } from '../../src/services/AudioManager';

const PodcastsScreen: React.FC = () => {
  const [lastSchoolsEpisode, setLastSchoolsEpisode] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(-1);
  const [currentSource, setCurrentSource] = useState<AudioSource | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const playbackState = Platform.OS === 'android' ? usePlaybackState() : { state: State.Stopped };
  const { position, duration } = Platform.OS === 'android' ? useProgress() : { position: 0, duration: 1 };
  const videoRefs = useRef<(React.ComponentRef<typeof Video> | null)[]>([]);

  // Listen for audio source changes
  useEffect(() => {
    const unsubscribe = audioManager.onSourceChange((source) => {
      setCurrentSource(source);
      // Update current episode index based on playing source
      if (source && source.type === 'podcast') {
        const episodeIndex = parseInt(source.id.split('-')[1]);
        setCurrentEpisodeIndex(episodeIndex);
      } else {
        setCurrentEpisodeIndex(-1);
      }
    });
    return unsubscribe;
  }, []);

  // Listen for volume changes from AudioManager
  useEffect(() => {
    const unsubscribe = audioManager.onVolumeChange((newVolume) => {
      setVolume(newVolume);
    });
    return unsubscribe;
  }, []);

  const handlePlay = async (index: number) => {
    const episode = lastSchoolsEpisode[index]?.episode?.attributes;
    const school = lastSchoolsEpisode[index]?.school;
    const audioUrl = Config.STRAPI_URL_BASE + episode?.audio?.data?.attributes?.url;

    if (currentEpisodeIndex === index) {
      // Same episode - toggle play/pause
      const isPlaying = await audioManager.isPlaying();
      if (isPlaying) {
        await audioManager.stop();
      } else {
        // Resume the current episode
        const currentSource = audioManager.getCurrentSource();
        if (currentSource) {
          await audioManager.playPodcast(currentSource);
        }
      }
    } else {
      // Different episode - load and play
      const podcastSource: AudioSource = {
        id: `podcast-${index}`,
        url: audioUrl,
        title: episode.title,
        artist: school.short_name,
        artwork: Config.STRAPI_URL_BASE + episode?.cover?.data?.attributes?.url,
        type: 'podcast',
        isLiveStream: false,
      };

      await audioManager.playPodcast(podcastSource);
      setCurrentEpisodeIndex(index);
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
                `/api/episodes`,
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
        const isPlaying = Platform.OS === 'android'
          ? (currentSource && currentSource.id === `podcast-${index}` && playbackState.state === State.Playing)
          : (currentSource && currentSource.id === `podcast-${index}`);
        //console.log('isPlaying: ', index, isPlaying);
        return (
          <Card key={school.slug} style={styles.card}>
            <Card.Cover source={{ uri: coverImageUrl }} />
            <Card.Content>
              <Text variant="headlineSmall">{school.short_name}</Text>
              <Text variant="titleMedium">{episode.title}</Text>
              <Markdown
                style={{
                  body: {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.onBackground,
                    fontSize: 14,
                  },
                }}>
                {episode.description ?? ''}
              </Markdown>
              {Platform.OS === 'ios' && (
                <Video
                  ref={(ref) => {
                    videoRefs.current[index] = ref;
                    if (Platform.OS === 'ios') {
                      audioManager.registerVideoRef(`podcast-${index}`, ref);
                    }
                  }}
                  source={{
                    uri: audioUrl,
                    headers: {
                      'User-Agent': 'WeBeRadioApp/1.0',
                      'Accept': '*/*',
                    }
                  }}
                  style={styles.audioPlayer}
                  paused={currentSource?.id !== `podcast-${index}`}
                  playInBackground={true}
                  playWhenInactive={true}
                  ignoreSilentSwitch="ignore"
                  disableFocus={true}
                  resizeMode="cover"
                  controls={false}
                  muted={false}
                  volume={volume}
                  rate={1.0}
                  onError={(error) => {
                    console.log(`iOS Podcast Video Error (${index}):`, error);
                  }}
                  onLoadStart={() => {
                    console.log(`iOS Podcast Load Start (${index})`);
                  }}
                  onLoad={() => {
                    console.log(`iOS Podcast Loaded (${index})`);
                  }}
                />
              )}
              {Platform.OS === 'android' && index === currentEpisodeIndex && (
                <SeekBar
                  onSeek={async (time: number) => {
                    await TrackPlayer.seekTo(time);
                  }}
                  trackLength={duration}
                  onSlidingStart={() => { }}
                  currentPosition={position}
                  theme={theme}
                />
              )}
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
