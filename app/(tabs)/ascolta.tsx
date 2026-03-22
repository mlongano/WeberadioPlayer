import React, { useCallback, useEffect, useState } from 'react';
import { episodesFetchAll, queryEpisodes } from '../../src/api/fetch';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import ErrorMessage from '@/src/components/ErrorMessage';
import RandomEpisode from '@/src/components/RandomEpisode';

const HomeScreen: React.FC = () => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEpisodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = {
        sort: 'date:desc',
        ...queryEpisodes,
      };
      const fetchedEpisodes = await episodesFetchAll(query);
      setEpisodes(fetchedEpisodes);
    } catch (err) {
      console.error(err);
      setError('Impossibile caricare gli episodi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchEpisodes} />;
  return <RandomEpisode episodes={episodes} />;
};

export default HomeScreen;
