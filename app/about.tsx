import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {useTheme} from 'react-native-paper';
import Markdown from 'react-native-marked';
import {heroImageFetch, strapiFetch} from './api/fetch';

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
      alignItems: 'center',
      backgroundColor: theme.colors.background,
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
    <View style={styles.container}>
      <Image
        source={require('./assets/logo.png')}
        style={{width: 200, height: 200}}
      />
      <Text>About</Text>
      <Markdown
        value={about}
        flatListProps={{
          initialNumToRender: 8,
          contentContainerStyle: {
            padding: 16,
            marginRight: 10,
            backgroundColor: theme.colors.background,
          },
        }}
      />
    </View>
  );
};

export default AboutScreen;
