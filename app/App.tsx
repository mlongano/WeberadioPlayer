import React, {useEffect, useState} from 'react';
import {View, StyleSheet, useColorScheme} from 'react-native';
import {BottomNavigation, Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MD3DarkTheme, MD3LightTheme} from 'react-native-paper';

// import SplashScreen from './SplashScreen';
import HomeScreen from './screens/HomeScreen';
import PlayerScreen from './screens/PlayerScreen';
import NewsScreen from './screens/NewsScreen';
import PodcastsScreen from './screens/PodcastsScreen';
import AboutScreen from './screens/AboutScreen';
import SplashScreen from './screens/SplashScreen';
import ExploreScreen from './screens/ExploreScreen';

import EpisodeCard from './components/EpisodeCard';
const App = () => {
  //console.log("Expo Constants: ",Constants.systemFonts);

  const [index, setIndex] = useState(-1);
  const [routes] = useState([
    {key: 'player', title: 'On Air', focusedIcon: 'play-circle'},
    {
      key: 'home',
      title: 'Home',
      focusedIcon: 'home',
      unfocusedIcon: 'home-outline',
    },
    {key: 'podcasts', title: 'Podcasts', focusedIcon: 'podcast'},
    {key: 'explore', title: 'Explore', focusedIcon: 'magnify'},
    {key: 'news', title: 'News', focusedIcon: 'newspaper'},
    {key: 'about', title: 'About', focusedIcon: 'information'},
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex(0);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const renderScene = BottomNavigation.SceneMap({
    player: PlayerScreen,
    home: HomeScreen,
    news: NewsScreen,
    podcasts: PodcastsScreen,
    explore: ExploreScreen,
    about: AboutScreen,
    episodes: EpisodeCard,
  });

  const renderSplashScreen = () => (
    <SplashScreen onSplashEnd={() => setIndex(0)} />
  );

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  //console.log("colorScheme:", colorScheme);
  //console.log("theme:", theme);
  //console.log("theme.dark:", theme.dark);
  //console.log("theme.mode:", theme.mode);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <View style={styles.container}>
          {index === -1 ? (
            renderSplashScreen()
          ) : (
            <BottomNavigation
              navigationState={{index, routes}}
              onIndexChange={setIndex}
              renderScene={renderScene}
            />
          )}
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

// eslint-disable-next-line eol-last, prettier/prettier
export default App;
