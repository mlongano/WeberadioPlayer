import React, { useEffect, useState } from 'react';
import { episodesFetchAll, queryEpisodes } from '../../src/api/fetch';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import RandomEpisode from '@/src/components/RandomEpisode';

const HomeScreen: React.FC = () => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const query = {
          sort: 'date:desc',
          ...queryEpisodes,
        };
        const fetchedEpisodes = await episodesFetchAll(query);
        setEpisodes(fetchedEpisodes);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEpisodes();
  }, []);

  //console.log("current time", currentTime);
  return isLoading ? <LoadingSpinner /> : <RandomEpisode episodes={episodes} />;
};

export default HomeScreen;
