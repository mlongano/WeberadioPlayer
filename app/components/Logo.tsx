import React from 'react';
import { Image, StyleSheet } from 'react-native';

const Logo: React.FC = () => {
  return (
    <Image
      source={require('../assets/logo.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 200,
  },
});

export default Logo;
