import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, ImageBackground, StatusBar } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  SlideInDown,
  SlideInUp,
  BounceIn,
  BounceInDown,
  BounceInLeft,
  BounceInRight,
  ZoomIn,
  FlipInEasyX,
  RotateInDownLeft,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeContent() {
  const { t, i18n } = useTranslation();

  const [progress, setProgress] = useState({
    coins: 0,
    crosswordLevel: 1,
    wordFindLevel: 1
  });

  // Animation values
  const coinScale = useSharedValue(1);
  const coinRotate = useSharedValue(0);
  const titleTranslateY = useSharedValue(-100);
  const titleOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const floatingCoins = useSharedValue(0);
  const buttonScales = useSharedValue([1, 1, 1, 1]);
  const langButtonScale = useSharedValue(1);
  const backgroundParticles = useRef<Array<{ id: number; x: number; y: number }>>([]);

  // Gesture values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue("0deg");
  const savedTranslation = { x: 0, y: 0 };

  useEffect(() => {
   
    startEntranceAnimations();
    createBackgroundParticles();
    startFloatingCoins();
  }, []);

  useEffect(() => {
    if (progress.coins > 0) {
      animateCoinUpdate();
    }
  }, [progress.coins]);

  const startEntranceAnimations = () => {
    // Title animation
    titleTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
    titleOpacity.value = withTiming(1, { duration: 800 });
    
    // Card animation
    cardScale.value = withSpring(1, { damping: 10, stiffness: 80 });
    cardOpacity.value = withTiming(1, { duration: 600 });
  };

  const startFloatingCoins = () => {
    floatingCoins.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.ease }),
        withTiming(0, { duration: 2000, easing: Easing.ease })
      ),
      -1,
      true
    );
  };

  const createBackgroundParticles = () => {
    backgroundParticles.current = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
    }));
  };

  const animateCoinUpdate = () => {
    coinScale.value = withSequence(
      withSpring(1.8, { damping: 3, stiffness: 150 }),
      withSpring(1, { damping: 8, stiffness: 120 })
    );
    
    coinRotate.value = withSequence(
      withTiming(15, { duration: 200 }),
      withTiming(-15, { duration: 200 }),
      withTiming(0, { duration: 200 })
    );
  };

  const animateButtonPress = (index: number) => {
    buttonScales.value[index] = withSequence(
      withSpring(0.9, { damping: 5, stiffness: 150 }),
      withSpring(1, { damping: 8, stiffness: 120 })
    );
  };

  
  // Gesture animations
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslation.x = translateX.value;
      savedTranslation.y = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = savedTranslation.x + event.translationX;
      translateY.value = savedTranslation.y + event.translationY;
      rotate.value = `${event.translationX * 0.1}deg`;
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 8, stiffness: 120 });
      translateY.value = withSpring(0, { damping: 8, stiffness: 120 });
      rotate.value = withSpring("0deg", { damping: 10, stiffness: 100 });
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      coinScale.value = withSequence(
        withSpring(1.5, { damping: 3, stiffness: 150 }),
        withSpring(1, { damping: 6, stiffness: 120 })
      );
    });

  const combinedGesture = Gesture.Simultaneous(panGesture, doubleTapGesture);

  // Animated styles
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  

 

  

  const gestureAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: rotate.value }
    ],
  }));

  

  const handleProjectOverView = () => {
    animateButtonPress(1);
    setTimeout(() => router.push("/"), 200);
  };

  const handleResumeDownload = () => {
    animateButtonPress(1);
    setTimeout(() => router.push("/"), 200);
  };

  

  const handleprofile = () => {
    animateButtonPress(3);
    setTimeout(() => router.push("/"), 200);
  };

  

  const changeLanguage = (lang: string) => {
    langButtonScale.value = withSequence(
      withSpring(0.8, { damping: 5, stiffness: 150 }),
      withSpring(1, { damping: 8, stiffness: 120 })
    );
    i18n.changeLanguage(lang);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require("../../assets/images/bgimage2.jpeg")}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        {/* Dark overlay like StageScreen */}
        <View style={styles.overlay}>
          <View style={styles.container}>
            
            {/* Background Particles */}
            {backgroundParticles.current.map((particle) => (
              <Animated.Text
                key={particle.id}
                entering={FadeIn.duration(1000).delay(particle.id * 100)}
                style={[
                  styles.particle,
                  {
                    left: particle.x,
                    top: particle.y,
                  }
                ]}
              >
                {['🪙', '✨', '💎', '🎮'][particle.id % 4]}
              </Animated.Text>
            ))}

            {/* Animated Title with Gesture */}
            <GestureDetector gesture={combinedGesture}>
              <Animated.View style={[styles.titleContainer, titleAnimatedStyle, gestureAnimatedStyle]}>
                <Animated.Text 
                  style={styles.title}
                  entering={BounceIn.duration(800)}
                >
                  🏠 {t("home_screen_title") || "Tamil Word Game"}
                </Animated.Text>
               
              </Animated.View>
            </GestureDetector>

            
           
            {/* Animated Language Selector */}
            <Animated.View 
              style={styles.languageContainer}
              entering={FlipInEasyX.duration(800).delay(1400)}
            >
              {["en", "ta", "fr", "de"].map((lang, index) => (
                <Animated.View
                  key={lang}
                  entering={RotateInDownLeft.duration(600).delay(1500 + index * 100)}
                >
                  <Pressable
                    style={[
                      styles.langButton,
                      i18n.language === lang && styles.activeLang
                    ]}
                    onPress={() => changeLanguage(lang)}
                  >
                    <Animated.Text style={styles.langText}>
                      {lang === "ta" ? "தமிழ்" : lang.toUpperCase()}
                    </Animated.Text>
                  </Pressable>
                </Animated.View>
              ))}
            </Animated.View>
          </View>
        </View>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

/* ================================
   Animated Level Item Component
================================= */

const LevelItem = ({ label, value, icon, delay = 0 }: any) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[styles.levelItem, animatedStyle]}>
      <Text style={styles.levelLabel}>{label}</Text>
      <Text style={styles.levelValue}>
        {icon} {value}
      </Text>
    </Animated.View>
  );
};

/* ================================
   Animated Main Button Component
================================= */

const MainButton = ({ title, color, onPress, delay = 0 }: any) => {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 15, stiffness: 120 })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 600 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable 
        style={[styles.button, { backgroundColor: color }]} 
        onPress={onPress}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
};

/* ================================
   Styles
================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 25,
    position: 'relative',
  },
  
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  
  backgroundImageStyle: {
    resizeMode: 'cover',
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay like StageScreen
    width: "100%",
    height: "100%",
  },

  particle: {
    position: 'absolute',
    fontSize: 20,
    opacity: 0.2, // Reduced opacity for particles
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  titleContainer: {
    alignItems: 'center',
    marginTop: 40, // Added top margin for status bar
  },

  title: {
    fontSize: 32, // Increased to match StageScreen
    fontWeight: "bold",
    textAlign: "center",
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 18, // Increased to match StageScreen
    color: '#DDDDDD',
    marginTop: 5,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  userCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(5px)', // Added blur effect like StageScreen
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  floatingCoinBg: {
    position: 'absolute',
    right: 20,
    top: 20,
  },

  floatingCoinText: {
    fontSize: 40,
    opacity: 0.2,
  },

  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#333333',
  },

  signupHint: {
    marginTop: 10,
    color: "#555555",
    fontSize: 14,
    fontWeight: '500',
  },

  coinText: {
    fontSize: 24,
    color: "#FFD700",
    marginVertical: 15,
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  levelContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },

  levelItem: {
    alignItems: "center",
    backgroundColor: 'rgba(248, 248, 248, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },

  levelLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },

  levelValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },

  buttonContainer: {
    gap: 12,
  },

  button: {
    padding: 16,
    borderRadius: 12, // Changed to match StageScreen
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600", // Changed to match StageScreen
    fontSize: 16, // Reduced to match StageScreen
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  languageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 20,
  },

  langButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    borderRadius: 12, // Changed to match StageScreen buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  activeLang: {
    backgroundColor: "rgba(46, 125, 50, 0.95)",
    transform: [{ scale: 1.05 }],
  },

  langText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },

  footer: {
    textAlign: 'center',
    color: '#EEEEEE',
    fontSize: 14,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});