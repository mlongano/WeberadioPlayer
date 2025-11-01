import React, { useEffect, useState } from 'react';
import { Config } from '../../src/utils/config';
import LoadingSpinner from '../components/LoadingSpinner';
import EpisodeCard from '../components/EpisodeCard';
import { FlatList, RefreshControl } from 'react-native';
import { flattenEpisode } from '../../src/api/fetch';

const RandomEpisode: React.FC<{ episodes: any[] }> = ({
  episodes,
}: {
  episodes: any[];
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<any | null>(null);
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
          (acc: string, school: any) => `${acc} ${school.short_name}`,
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
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    />
  );
};

export default RandomEpisode;
