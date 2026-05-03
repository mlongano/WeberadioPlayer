import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, ScrollView, Platform } from 'react-native';
import Video from 'react-native-video';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { Config } from '../../src/utils/config';
import { queryEpisodes, schoolsFetchAllBasic, strapiFetch } from '../../src/api/fetch';
import { SchoolLastEpisode, SchoolQuery } from '../../src/api/types';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import ErrorMessage from '@/src/components/ErrorMessage';
import SeekBar from '@/src/components/SeekBar';
import Markdown from 'react-native-markdown-display';
import TrackPlayer, { State, usePlaybackState, useProgress } from 'react-native-track-player';
import { audioManager, AudioSource } from '../../src/services/AudioManager';
import { useRadioPlayer } from '../../src/hooks/useRadioPlayer';

const PodcastsScreen: React.FC = () => {
  const [lastSchoolsEpisode, setLastSchoolsEpisode] = useState<SchoolLastEpisode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentSource, isPlaying: isPlayerPlaying, volume, playPodcast, stop } = useRadioPlayer();
  const playbackState = Platform.OS === 'android' ? usePlaybackState() : { state: State.Stopped };
  const { position, duration } = Platform.OS === 'android' ? useProgress() : { position: 0, duration: 1 };
  const videoRefs = useRef<(React.ComponentRef<typeof Video> | null)[]>([]);

  const handlePlay = async (index: number) => {
    const episode = lastSchoolsEpisode[index]?.episode;
    const school = lastSchoolsEpisode[index]?.school;
    if (!episode || !school) return;

    const audioUrl = (Config.STRAPI_URL_BASE ?? '') + (episode.audio?.url ?? '');

    const isCurrentEpisode = currentSource?.id === `podcast-${index}`;

    if (isCurrentEpisode) {
      if (isPlayerPlaying) {
        await stop();
      } else {
        if (currentSource) {
          await playPodcast(currentSource);
        }
      }
    } else {
      const podcastSource: AudioSource = {
        id: `podcast-${index}`,
        url: audioUrl,
        title: episode.title,
        artist: school.short_name,
        artwork: (Config.STRAPI_URL_BASE ?? '') + (episode.cover?.url ?? ''),
        type: 'podcast',
        isLiveStream: false,
      };

      await playPodcast(podcastSource);
    }
  };

  const fetchPodcasts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const schools = await schoolsFetchAllBasic();
      const queriesSchoolsLastEpisode = schools.map((school: SchoolQuery) => {
        return {
          school: school,
          query: {
            sort: 'date:desc',
            filters: {
              schools: {
                slug: {
                  $eq: school.slug,
                },
              },
            },
            ...queryEpisodes,
          },
        };
      });

      const schoolsLastEpisode = await Promise.all(
        queriesSchoolsLastEpisode.map(async (querySchool: { school: SchoolQuery; query: Record<string, unknown> }) => {
          try {
            const episode = await strapiFetch(
              `/api/episodes`,
              querySchool.query,
              false,
              1,
            );
            return {
              school: querySchool.school,
              episode: episode?.data[0] ?? null,
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
        (item): item is SchoolLastEpisode & { episode: NonNullable<SchoolLastEpisode['episode']> } => item.episode !== null,
      );
      episodes.sort((a, b) => {
        const dateA = a.episode?.date ?? '';
        const dateB = b.episode?.date ?? '';
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        return 0;
      });

      setLastSchoolsEpisode(episodes);
    } catch (err) {
      console.error(err);
      setError('Impossibile caricare i podcast.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
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
  }), [theme.colors.background, theme.colors.primary, theme.colors.onBackground]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchPodcasts} />;
  }

  return (
    <ScrollView style={styles.container}>
      {lastSchoolsEpisode.map((item, index) => {
        const episode = item?.episode;
        const school = item?.school;
        if (!episode || !school) return null;
        const coverImageUrl =
          (Config.STRAPI_URL_BASE ?? '') + (episode.cover?.url ?? '');
        const audioUrl =
          (Config.STRAPI_URL_BASE ?? '') + (episode.audio?.url ?? '');
        const isPlaying = isPlayerPlaying && currentSource?.id === `podcast-${index}`;
        return (
          <Card key={school.slug} style={styles.card} accessible={true} accessibilityLabel={`Podcast: ${episode.title} di ${school.short_name}`}>
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
              {Platform.OS === 'android' && currentSource?.id === `podcast-${index}` && (
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
                textColor={theme.colors.onPrimary}
                accessibilityLabel={isPlaying ? `Ferma ${episode.title}` : `Riproduci ${episode.title}`}
              >
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
