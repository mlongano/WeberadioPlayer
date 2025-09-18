import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useTheme} from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import {heroImageFetch, strapiFetch} from './api/fetch';
import * as Linking from 'expo-linking';

const AboutScreen: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [about, setAbout] = useState<string>('');
  const [heroImage, setHeroImage] = useState<string>('');

  useEffect(() => {
    const fetchHomeScreenInfo = async () => {
      const {
        data: {
          attributes: {title},
        },
        data: {
          attributes: {about},
        },
      } = await strapiFetch('/api/about-us', {fields: ['title', 'about']});
      const heroImage = await heroImageFetch('home_page');
      setTitle(title);
      setAbout(about);
      setHeroImage(heroImage);
    };

    fetchHomeScreenInfo();
  }, []);

  const theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={() => Linking.openURL('https://webe.radio')}>
        <Image
          source={require('./assets/logo.png')}
          style={{width: 200, height: 200}}
        />
      </TouchableOpacity>
      <Text>About</Text>
      <Markdown
        style={{
          body: {
            backgroundColor: theme.colors.background,
            color: theme.colors.onBackground,
            fontSize: 12,
          },
        }}>
        {about}
      </Markdown>
    </ScrollView>
  );
};

export default AboutScreen;
