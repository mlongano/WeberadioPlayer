import React, { useEffect, useState } from 'react';
import { Config } from '@/src/utils/config';
import LoadingSpinner from './LoadingSpinner';
import EpisodeCard from './EpisodeCard';
import { FlatList, RefreshControl } from 'react-native';
import { flattenEpisode } from '@/src/api/fetch';
import { Episode, EpisodeQuery } from '@/src/api/types';
import { audioManager } from '@/src/services/AudioManager';

const RandomEpisode: React.FC<{ episodes: EpisodeQuery[] }> = ({
  episodes,
}: {
  episodes: EpisodeQuery[];
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const selectRandomEpisode = () => {
    //console.log('fetchedEpisodes', JSON.stringify(episodes, null, 2));
    if (!episodes || episodes.length === 0) return; // Guard against missing episodes

    // Pre-filter episodes with valid audio URLs
    const episodesWithAudio = episodes.filter(ep => {
      const flattened = flattenEpisode(ep);
      return flattened.audioUrl && flattened.audioUrl.trim() !== '';
    });

    // Fallback if no episodes have audio
    if (episodesWithAudio.length === 0) {
      console.warn('No episodes with valid audio URLs found');
      setSelectedEpisode(null);
      return;
    }

    // Select random episode from filtered list
    const randomIndex = Math.floor(Math.random() * episodesWithAudio.length);
    const randomEpisode = flattenEpisode(episodesWithAudio[randomIndex]);

    setSelectedEpisode(randomEpisode);
  };

  const onRefresh = () => {
    const state = audioManager.getSnapshot();
    if (state.currentSource?.type === 'episode' && state.isPlaying) {
      audioManager.stop();
    }
    selectRandomEpisode();
    setIsRefreshing(false);
  };

  useEffect(() => {
    onRefresh();
  }, [episodes]);

  const renderItem = (): React.JSX.Element | null => {
    if (!selectedEpisode) return null; // Guard against missing episode

    return (
      <EpisodeCard
        title={selectedEpisode.title}
        description={selectedEpisode.description}
        audioUrl={selectedEpisode.audioUrl}
        imageUrl={selectedEpisode.coverImageUrl}
        cardTitle={selectedEpisode.podcast.title}
        cardSubtitle={selectedEpisode.schools.reduce(
          (acc: string, school: { short_name: string }) => `${acc} ${school.short_name}`,
          '',
        )}
      />
    );
  };

  return isRefreshing ? (
    <LoadingSpinner />
  ) : (
    //console.log("current time", currentTime);
    <FlatList
      data={[selectedEpisode]}
      renderItem={renderItem}
      keyExtractor={() => 'random-episode-card'}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} accessibilityLabel="Scorri per un episodio casuale" />
      }
    />
  );
};

export default RandomEpisode;
