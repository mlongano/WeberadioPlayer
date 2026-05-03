import React from 'react';
import Icon from '@expo/vector-icons/MaterialIcons';

import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MD3Theme } from 'react-native-paper';

interface Props {
  isPlaying: boolean;
  onPressPlay: () => void;
  onPressPause: () => void;
  theme?: MD3Theme;
}


const baseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    marginBottom: 16,
  },
  playButton: {
    height: 72,
    width: 72,
    borderWidth: 1,
    borderRadius: 72 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryControl: {
    height: 18,
    width: 18,
  },
  off: {
    opacity: 0.30,
  }
});

const Controls: React.FC<Props> = ({
  isPlaying,
  onPressPlay,
  onPressPause,
  theme,
}) => {
  const styles = {
    ...baseStyles,
    playButton: {
      ...baseStyles.playButton,
      borderColor: theme ? theme.colors.primary : 'rgb(253 224 71)',
    },
  };

  return (
    <View style={styles.container}>
      {!isPlaying ?
        <TouchableOpacity
          onPress={onPressPlay}
          accessibilityRole="button"
          accessibilityLabel="Riproduci"
          accessibilityState={{ selected: false }}
        >
          <View style={styles.playButton}>
            <Icon name={'play-arrow'} size={50} color={theme ? theme.colors.primary : 'rgb(253 224 71)'} />
          </View>
        </TouchableOpacity> :
        <TouchableOpacity
          onPress={onPressPause}
          accessibilityRole="button"
          accessibilityLabel="Pausa"
          accessibilityState={{ selected: true }}
        >
          <View style={styles.playButton}>
            <Icon name={'pause'} size={50} color={theme ? theme.colors.primary : 'rgb(253 224 71)'} />
          </View>
        </TouchableOpacity>
      }
    </View>
  )
};

export default Controls;

