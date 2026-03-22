import Slider from '@react-native-community/slider';
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MD3Theme } from 'react-native-paper';

function pad(n: string, width: number, z = '0') {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const minutesAndSeconds = (position: number) => ([
  pad(Math.floor(position / 60).toString(), 2),
  pad(Math.floor(position % 60).toString(), 2)
]);

interface Props {
  trackLength: number;
  currentPosition: number;
  onSeek: (value: number) => void;
  onSlidingStart: () => void;
  theme: MD3Theme;
}

const SeekBar = ({
  trackLength,
  currentPosition,
  onSeek,
  onSlidingStart,
  theme,
}: Props) => {
  const elapsed = minutesAndSeconds(currentPosition);
  const remaining = minutesAndSeconds(trackLength - currentPosition);
  const styles = StyleSheet.create({
    slider: {
      marginTop: 0,
    },
    container: {
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 10,
    },
    track: {
      height: 2,
      borderRadius: 1,
    },
    text: {
      color: theme.colors.onBackground,
      fontSize: 12,
      textAlign: 'center',
    }
  });
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.text} accessibilityLabel={`Tempo trascorso ${elapsed[0]} minuti ${elapsed[1]} secondi`}>
          {elapsed[0] + ":" + elapsed[1]}
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={[styles.text, { width: 40 }]} accessibilityLabel={trackLength > 1 ? `Tempo rimanente ${remaining[0]} minuti ${remaining[1]} secondi` : ''}>
          {trackLength > 1 && "-" + remaining[0] + ":" + remaining[1]}
        </Text>
      </View>
      <Slider
        maximumValue={Math.max(trackLength, 1, currentPosition + 1)}
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSeek}
        value={currentPosition}
        style={styles.slider}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.shadow}
        accessibilityLabel="Posizione brano"
        />
    </View>
  );
};

export default SeekBar;
