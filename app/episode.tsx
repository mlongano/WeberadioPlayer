import React from 'react';
import {useLocalSearchParams} from 'expo-router';
import EpisodeCard from './components/EpisodeCard';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';

type Episode = {
  title: string;
  description: string;
  imageUrl: string;
  audioUrl: string;
  schools: string;
  podcastTitle: string;
};

const EpisodeScreen: React.FC = () => {
  const {title, description, imageUrl, audioUrl, schools, podcastTitle} =
    useLocalSearchParams<Episode>();

  return (
    <SafeAreaProvider>
      <EpisodeCard
        title={title}
        description={description}
        audioUrl={audioUrl}
        imageUrl={imageUrl}
        cardTitle={podcastTitle}
        cardSubtitle={schools}
      />
    </SafeAreaProvider>
  );
};

export default EpisodeScreen;
