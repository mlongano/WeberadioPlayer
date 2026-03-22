import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { View, Image, StyleSheet } from 'react-native';
import {
  Text,
  useTheme,
  Card,
  Searchbar,
  Button,
  IconButton,
} from 'react-native-paper';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/src/components/useColorScheme';
import { episodesFetchAll, flattenEpisode, queryEpisodes } from '../../src/api/fetch';
import Fuse from 'fuse.js';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import ErrorMessage from '@/src/components/ErrorMessage';

import { useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { EpisodeQuery } from '../../src/api/types';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type Episode = {
  title: string;
  description: string;
  audioUrl: string;
  imageUrl: string;
  schools: string;
  podcastTitle: string;
};

const ExploreScreen: React.FC = () => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const [contentVerticalOffset, setContentVerticalOffset] = useState(0);
  const CONTENT_OFFSET_THRESHOLD = 300;
  const colorScheme = useColorScheme();

  const router = useRouter();

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        sort: 'date:desc',
        ...queryEpisodes,
      };
      const episodes = await episodesFetchAll(query);
      setEpisodes(episodes);
    } catch (err) {
      console.error(err);
      setError('Impossibile caricare gli episodi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    scrollTopButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
  }), []);

  const [searchQuery, setSearchQuery] = useState('');
  const fuseOptions = useMemo(() => ({
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
  }), []);

  const fuse = useMemo(() => new Fuse(episodes, fuseOptions), [episodes, fuseOptions]);
  const fusePosts =
    searchQuery.length > 0
      ? fuse.search(searchQuery).map((result: any) => result.item)
      : episodes;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchEpisodes} />;
  }

  const renderItem = ({ item }: { item: EpisodeQuery }) => {
    const flatEpisode = flattenEpisode(item);
    const episodeParams: Episode = {
      title: flatEpisode.title,
      description: flatEpisode.description,
      audioUrl: flatEpisode.audioUrl,
      imageUrl: flatEpisode.coverImageUrl,
      schools: flatEpisode.schools.reduce(
        (acc: string, school: any) => `${acc} ${school.short_name}`,
        '',
      ),
      podcastTitle: flatEpisode.podcast.title,
    };

    return (
      <Card style={{ margin: 10 }} onPress={() => { }}>
        <Card.Cover source={{ uri: flatEpisode.coverImageUrl }} />
        <Card.Content>
          <Text style={{ marginTop: 15 }} variant="titleMedium">
            {flatEpisode.podcast.title}
          </Text>
          {flatEpisode.schools.map((school: any) => (
            <Text key={school.id} variant="titleMedium">
              {school.short_name}
            </Text>
          ))}
          <Text variant="bodySmall">{flatEpisode.date}</Text>
          <Text
            style={{ marginBottom: 5, marginTop: 10 }}
            variant="headlineSmall">
            {flatEpisode.title}
          </Text>
          <Markdown
            style={{
              body: {
                backgroundColor: theme.colors.background,
                color: theme.colors.onBackground,
                fontSize: 14,
              },
            }}>
            {flatEpisode.description ?? ''}
          </Markdown>
        </Card.Content>
        <Card.Actions>
          <Button
            icon={'play'}
            mode="elevated"
            onPress={() => {
              router.push({
                pathname: '/episode',
                params: episodeParams,
              });
            }}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}>
            Apri
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Searchbar
          style={{ marginBottom: 10, marginTop: 10 }}
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          icon="magnify"
          placeholder="Cerca..."
        />

        {fusePosts?.length > 0 ? (
          <FlatList
            data={fusePosts}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            ref={listRef}
            onScroll={event => {
              setContentVerticalOffset(event.nativeEvent.contentOffset.y);
            }}
          />
        ) : (
          <View>
            <Text>Nessun episodio trovato</Text>
            <Image
              source={require('@/assets/undraw_page_not_found_su7k.png')}
              style={{ resizeMode: 'contain', width: '100%', height: '100%' }}
            />
          </View>
        )}
        {contentVerticalOffset > CONTENT_OFFSET_THRESHOLD && (
          <IconButton
            icon="arrow-up-bold-circle"
            iconColor={Colors[colorScheme ?? 'light'].tint}
            size={40}
            // previously configured Icon props
            style={styles.scrollTopButton}
            onPress={() => {
              listRef.current!.scrollToOffset({ offset: 0, animated: true });
            }}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default ExploreScreen;
