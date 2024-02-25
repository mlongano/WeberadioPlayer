import React, {useEffect, useState} from 'react';
import {episodesFetchAll, queryEpisodes} from '../api/fetch';
import {Config} from '../utils/config';
import LoadingSpinner from '../components/LoadingSpinner';
import EpisodeCard from '../components/EpisodeCard';

const HomeScreen: React.FC = () => {
  const [episode, setEpisode] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRandomEpisode = async () => {
      try {
        const query = {
          sort: 'date:desc',
          ...queryEpisodes,
        };
        const episodes = await episodesFetchAll(query);

        const numberOfEpisodes = episodes?.length;
        const selectedEpisode = Math.floor(Math.random() * numberOfEpisodes);
        // eslint-disable-next-line @typescript-eslint/no-shadow
        let episode = episodes[selectedEpisode]?.attributes;
        while (!episode?.audio?.data?.attributes?.url) {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const selectedEpisode = Math.floor(Math.random() * numberOfEpisodes);
          episode = episodes[selectedEpisode]?.attributes;
        }
        setEpisode(episode);
        setLoading(false);
        //console.log("episode:", episode.audio.data.attributes.url);
        //console.log("schools", schools);
        //console.log("strapiUrlBase", strapiUrlBase);
        //console.log("heroImage", heroImage);
        //console.log("homePageText", homePageText);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRandomEpisode();
  }, []);

  const audioUrl = `${Config.STRAPI_URL_BASE}${episode?.audio?.data?.attributes?.url}`;
  const imageUrl = `${Config.STRAPI_URL_BASE}${episode?.cover?.data?.attributes?.url}`;
  //console.log("audioUrl", audioUrl);
  //console.log("imageUrl", imageUrl);

  if (loading) {
    return <LoadingSpinner />;
  }

  //console.log("current time", currentTime);
  return (
    <EpisodeCard
      title={episode?.title}
      description={episode?.description}
      audioUrl={audioUrl}
      imageUrl={imageUrl}
    />
  );
};

export default HomeScreen;
