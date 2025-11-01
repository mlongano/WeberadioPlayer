import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from 'react-native';
import { Platform } from 'react-native';
import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { PlaybackService } from '../src/services/PlaybackService';
import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    // Only initialize TrackPlayer on Android for now
    // iOS support in TrackPlayer v5 alpha is limited
    if (Platform.OS === 'android') {
      const setupTrackPlayer = async () => {
        try {
          // In v5.x, register the playback service
          console.log('Registering PlaybackService...');
          TrackPlayer.registerPlaybackService(() => require('../src/services/PlaybackService').PlaybackService);

          await TrackPlayer.setupPlayer({
            // Add any player options here if needed
          });

          // Optional: Set up capabilities
          await TrackPlayer.updateOptions({
            android: {
              appKilledPlaybackBehavior:
                AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
              Capability.Stop,
            ],
          });

        } catch (error) {
          console.log('Error setting up TrackPlayer:', error);
        }
      };
      setupTrackPlayer();
    }
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      //      SplashScreenExpo.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  console.log('colorScheme: ', colorScheme);
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider theme={theme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="about"
            options={{ title: 'Informazioni', presentation: 'modal' }}
          />
          <Stack.Screen
            name="episode"
            options={{ title: 'Episodio', presentation: 'modal' }}
          />
          <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
        </Stack>
      </PaperProvider>
    </ThemeProvider>
  );
}
