import Slider from '@react-native-community/slider';
import React, { Component } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';


interface Props {
  volume: number;
  onChange: (value: number) => void;
}

const VulumeBar:React.FC<Props> = ({
  volume,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <Slider
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        onValueChange={onChange}
        value={volume}
        style={styles.slider}
        minimumTrackTintColor='#fff'
        maximumTrackTintColor='rgba(255, 255, 255, 0.14)'
        />
    </View>
  );
};

export default VulumeBar;

const styles = StyleSheet.create({
  slider: {
    marginTop: -15,
    marginBottom: 0,
    marginRight: 40,
  },
  container: {
    flex: 1,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 32,
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    textAlign:'center',
  }
});
