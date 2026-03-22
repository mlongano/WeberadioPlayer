import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MD3Theme } from 'react-native-paper';

interface Props {
  title: string;
  artist: string;
  album: string;
  year: string;
  onTitlePress?: () => void;
  onArtistPress?: () => void;
  theme: MD3Theme;
}

const TrackDetails: React.FC<Props> = ({
  title,
  artist,
  album,
  year,
  onTitlePress,
  onArtistPress,
  theme
}) => {
  const styles = StyleSheet.create({
    container: {
      paddingTop: 24,
      flexDirection: 'row',
      paddingLeft: 20,
      alignItems: 'center',
      paddingRight: 20,
    },
    detailsWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      textAlign: 'center',
    },
    artist: {
      color: theme.colors.onBackground,
      fontSize: 12,
      marginTop: 4,
    },
    button: {
      opacity: 0.72,
    },
    moreButton: {
      borderColor: theme.colors.onBackground,
      borderWidth: 2,
      opacity: 0.72,
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreButtonIcon: {
      height: 17,
      width: 17,
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.detailsWrapper}>
        <Text style={styles.title} onPress={onTitlePress} accessibilityRole="text" accessibilityLabel={`Titolo: ${title}`}>{title}</Text>
        <Text style={styles.artist} onPress={onArtistPress} accessibilityRole="text" accessibilityLabel={`Artista: ${artist}, Album: ${album}`}>{artist} - {album}</Text>
        <Text style={styles.artist} onPress={onArtistPress} accessibilityRole="text" accessibilityLabel={`Anno: ${year}`}>{year}</Text>
      </View>
    </View>
  )
};

export default TrackDetails;

