import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Text,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { strapiFetch } from '../src/api/fetch';
import * as Linking from 'expo-linking';

const AboutScreen: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [about, setAbout] = useState<string>('');

  useEffect(() => {
    const fetchHomeScreenInfo = async () => {
      try {
        const result = await strapiFetch('/api/about-us', { fields: ['title', 'about'] });
        const { title, about } = result.data.attributes;
        setTitle(title);
        setAbout(about);
      } catch (error) {
        console.error('Error fetching about data:', error);
        // Set default values if fetch fails
        setTitle('WeBe Radio');
        setAbout('Welcome to WeBe Radio - your favorite radio station!');
      }
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
          style={{ width: 200, height: 200 }}
        />
      </TouchableOpacity>
      {title ? (
        <Text style={styles.title}>{title}</Text>
      ) : null}
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
