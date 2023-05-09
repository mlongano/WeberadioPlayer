import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { BottomNavigation, Text, Provider as PaperProvider, useTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// import SplashScreen from './SplashScreen';
import HomeScreen from './screens/HomeScreen';
import PlayerScreen from './screens/PlayerScreen';
import NewsScreen from './screens/NewsScreen';
import PodcastsScreen from './screens/PodcastsScreen';
import AboutScreen from './screens/AboutScreen';
import SplashScreen from './screens/SplashScreen';

const App = () => {
  const [index, setIndex] = useState(-1);
  const [routes] = useState([
    { key: 'home', title: 'Home', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'player', title: 'On Air', focusedIcon: 'play-circle' },
    { key: 'podcasts', title: 'Podcasts', focusedIcon: 'podcast' },
    { key: 'news', title: 'News', focusedIcon: 'newspaper' },
    { key: 'about', title: 'About', focusedIcon: 'information' },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex(0);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    player: PlayerScreen,
    news: NewsScreen,
    podcasts: PodcastsScreen,
    about: AboutScreen,
  });

  const renderSplashScreen = () => <SplashScreen onSplashEnd={() => setIndex(0)} />;

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  console.log("colorScheme:", colorScheme);
  //console.log("theme:", theme);
  console.log("theme.dark:", theme.dark);
  console.log("theme.mode:", theme.mode);
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
              navigationState={{ index, routes }}
              onIndexChange={setIndex}
              renderScene={renderScene}
            />
          )}
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
};


export default App;