import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

const LoadingSpinner: React.FC = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startRotation();

    return () => {
      rotateAnim.stopAnimation();
    };
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/*<Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]} /> */}
      <ActivityIndicator size={60} accessibilityLabel="Caricamento in corso" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#ccc',
    borderTopColor: '#999',
  },
});

export default LoadingSpinner;
