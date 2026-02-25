// app/index.tsx - Splash Screen
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  // Animations
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const ringScale1 = useSharedValue(0.5);
  const ringScale2 = useSharedValue(0.5);
  const ringOpacity1 = useSharedValue(0);
  const ringOpacity2 = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(20);
  const nameOpacity = useSharedValue(0);
  const nameY = useSharedValue(30);
  const overlayOpacity = useSharedValue(0);

  const navigateToHome = () => {
    router.replace('/home');
  };

  useEffect(() => {
    StatusBar.setHidden(true);

    // Logo entrance
    logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    // Glowing rings
    ringOpacity1.value = withDelay(400, withTiming(1, { duration: 500 }));
    ringScale1.value = withDelay(400, withSequence(
      withTiming(1.3, { duration: 1000, easing: Easing.out(Easing.exp) }),
      withTiming(1.15, { duration: 800 })
    ));

    ringOpacity2.value = withDelay(600, withTiming(0.6, { duration: 500 }));
    ringScale2.value = withDelay(600, withSequence(
      withTiming(1.7, { duration: 1200, easing: Easing.out(Easing.exp) }),
      withTiming(1.5, { duration: 800 })
    ));

    // Name
    nameOpacity.value = withDelay(800, withTiming(1, { duration: 700 }));
    nameY.value = withDelay(800, withSpring(0, { damping: 15 }));

    // Tagline
    taglineOpacity.value = withDelay(1100, withTiming(1, { duration: 700 }));
    taglineY.value = withDelay(1100, withSpring(0, { damping: 15 }));

    // Navigate after 2.8s
    const timer = setTimeout(() => {
      overlayOpacity.value = withTiming(1, { duration: 500 }, () => {
        runOnJS(navigateToHome)();
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale1.value }],
    opacity: ringOpacity1.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale2.value }],
    opacity: ringOpacity2.value,
  }));

  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ translateY: nameY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D0D0D', '#1A0A2E', '#0D0D0D']}
        style={StyleSheet.absoluteFill}
      />

      {/* Background glow */}
      <View style={styles.bgGlow} />

      {/* Rings */}
      <Animated.View style={[styles.ring, styles.ring2, ring2Style]} />
      <Animated.View style={[styles.ring, styles.ring1, ring1Style]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <LinearGradient
          colors={['#7F5AF0', '#2CB67D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <Text style={styles.logoText}>KB</Text>
        </LinearGradient>
      </Animated.View>

      {/* Name */}
      <Animated.View style={nameStyle}>
        <Text style={styles.name}>KRISHNABHARATHI</Text>
        <Text style={styles.nameLight}>SAKTHIVEL</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, taglineStyle]}>
        <View style={styles.taglineLine} />
        <Text style={styles.tagline}>Building Scalable, Secure & High-Performance Web Applications</Text>
        <View style={styles.taglineLine} />
      </Animated.View>

      {/* Transition overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  bgGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(127, 90, 240, 0.08)',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -200 }, { translateY: -200 }],
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  ring1: {
    width: 180,
    height: 180,
    borderColor: 'rgba(127, 90, 240, 0.6)',
    shadowColor: '#7F5AF0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  ring2: {
    width: 240,
    height: 240,
    borderColor: 'rgba(44, 182, 125, 0.3)',
    shadowColor: '#2CB67D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },
  logoContainer: {
    shadowColor: '#7F5AF0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 25,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
    textAlign: 'center',
  },
  nameLight: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  taglineLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(127, 90, 240, 0.4)',
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  overlay: {
    backgroundColor: '#0D0D0D',
    zIndex: 100,
  },
});
