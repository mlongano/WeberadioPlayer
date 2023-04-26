import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

interface Props {
  isPlaying: boolean;
  onPressPlay: () => void;
  onPressPause: () => void;
}


const Controls: React.FC<Props> = ({
  isPlaying,
  onPressPlay,
  onPressPause,
}) => (
  <View style={styles.container}>
    {!isPlaying ?
      <TouchableOpacity onPress={onPressPause}>
        <View style={styles.playButton}>
          <Icon name={'play-arrow'} size={50} color={'rgb(253 224 71)'}/>
        </View>
      </TouchableOpacity> :
      <TouchableOpacity onPress={onPressPlay}>
        <View style={styles.playButton}>
          <Icon name={'stop'}  size={50} color='rgb(253 224 71)'/>
        </View>
      </TouchableOpacity>
    }
  </View>
);

export default Controls;

const styles = StyleSheet.create({
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
    borderColor: 'rgb(253 224 71)',
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
})
