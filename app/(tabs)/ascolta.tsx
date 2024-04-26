import React, {useEffect, useState} from 'react';
import {episodesFetchAll, queryEpisodes} from '../api/fetch';
import LoadingSpinner from '../components/LoadingSpinner';
import RandomEpisode from '../components/RandomEpisode';

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
        // console.log('fetchedEpisodes', JSON.stringify(episodes, null, 2));
      } catch (error) {
        console.error(error);
      }
    };
    fetchEpisodes();
    setIsLoading(false);
    console.log('episodes LOADED');
  }, []);

  //console.log("current time", currentTime);
  return isLoading ? <LoadingSpinner /> : <RandomEpisode episodes={episodes} />;
};

export default HomeScreen;
