import React from 'react';

import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

interface Props {
  url: string;
  onPress?: () => void;
}

const AlbumArt: React.FC<Props> = ({
  url,
  onPress
}) => (
  <View style={styles.container}>
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="image"
      accessibilityLabel="Copertina album"
    >
      <Image
        key={url}
        style={styles.image}
        source={{ uri: url }}
        accessible={true}
        accessibilityLabel="Copertina album"
      />
    </TouchableOpacity>
  </View>
);

export default AlbumArt;

const { width, height } = Dimensions.get('window');
const imageSize = width - 48;

const styles = StyleSheet.create({
  container: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  image: {
    width: imageSize,
    height: imageSize,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
})
