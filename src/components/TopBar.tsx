import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

interface Props {
  message: string;
  onDownPress?: () => void;
  onQueuePress?: () => void;
  onMessagePress?: () => void;
}

const TopBar: React.FC<Props> = ({
  message,
  onDownPress,
  onQueuePress,
  onMessagePress,
}) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onDownPress} accessibilityRole="button" accessibilityLabel="Chiudi">
      <Image style={styles.button}
        source={require('@/assets/ic_keyboard_arrow_down_white.png')} />
    </TouchableOpacity>
    <Text onPress={onMessagePress}
      style={styles.message} accessibilityRole="button" accessibilityLabel={message}>{message.toUpperCase()}</Text>
    <TouchableOpacity onPress={onQueuePress} accessibilityRole="button" accessibilityLabel="Coda di riproduzione">
      <Image style={styles.button}
        source={require('@/assets/ic_queue_music_white.png')} />
    </TouchableOpacity>
  </View>
);

export default TopBar;

const styles = StyleSheet.create({
  container: {
    height: 72,
    paddingTop: 20,
    paddingLeft: 12,
    paddingRight: 12,
    flexDirection: 'row',
  },
  message: {
    flex: 1,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.72)',
    fontWeight: 'bold',
    fontSize: 10,
  },
  button: {
    opacity: 0.72
  }
});
