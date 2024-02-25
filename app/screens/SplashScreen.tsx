import React, {useRef, useEffect} from 'react';
import {View, Animated, StyleSheet} from 'react-native';

import Logo from '../components/Logo';
import {useTheme} from 'react-native-paper';

const SplashScreen: React.FC<{onSplashEnd: () => void}> = ({onSplashEnd}) => {
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      onSplashEnd();
    });
  }, [animationValue, onSplashEnd]);

  const animationStyle = {
    opacity: animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        scale: animationValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.5, 1],
        }),
      },
    ],
  };

  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animationStyle]}>
        <Logo />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
