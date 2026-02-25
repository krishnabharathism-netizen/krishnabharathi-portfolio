// app/home.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/theme/ThemeContext';
import { NavBar } from '../src/components/NavBar';
import { PORTFOLIO_DATA } from '../src/data/portfolio';
import { EmailComposeModal } from '../src/components/EmailComposeModal';
import About from './about';
import Skills from './skills';
import Projects from './projects';
import Experience from './experience';
import Contact from './contact';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TYPING_ROLES = PORTFOLIO_DATA.personal.roleAlt;

// Responsive sizing utilities
const getResponsiveValue = (mobile: number, tablet: number, desktop: number, currentWidth: number) => {
  if (currentWidth < 768) return mobile;
  if (currentWidth < 1024) return tablet;
  return desktop;
};

// ─── Hire Me — default pre-filled email content ───────────────────────────────
const HIRE_ME_EMAIL     = 'krishnabharathisakthivel@gmail.com';
const HIRE_ME_SUBJECT   = 'Job Opportunity for Krishnabharathi Sakthivel';
const HIRE_ME_BODY      =
`Hi Krishnabharathi,

I came across your portfolio and I'm impressed by your work. We have an exciting opportunity that aligns well with your skill set.

Company: 
Position: 
Location / Remote: 

Job Description:

We'd love to schedule a call to discuss further. Please let us know your availability.

Looking forward to hearing from you!

Best regards,
[Your Name]
[Company] | [Contact Number]`;

// ─────────────────────────────────────────────────────────────────────────────
//  RESUME DOWNLOAD  —  Web + Android + iOS (Fixed & Simplified)
// ─────────────────────────────────────────────────────────────────────────────
async function downloadResume() {
  // ── WEB ──────────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    try {
      const pdfAsset = require('../assets/pdf/resume.pdf');
      const pdfUrl: string =
        typeof pdfAsset === 'string'
          ? pdfAsset
          : pdfAsset?.uri ?? pdfAsset?.default ?? pdfAsset;
      if (!pdfUrl) throw new Error('Could not resolve PDF URL');
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = 'Krishnabharathi_Resume.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    } catch (err: any) {
      throw new Error('Web download failed: ' + (err?.message ?? err));
    }
    return;
  }

  // ── NATIVE (Android / iOS) — Simple & Reliable approach ─────────────────
  //
  // Strategy:
  //   1. Load the bundled PDF asset using expo-asset
  //   2. Copy to a writable location using expo-file-system (stable copyAsync)
  //   3. Share via expo-sharing (opens native share sheet / save dialog)
  //
  // We deliberately avoid expo-file-system/next and expo-file-system/legacy
  // as those sub-paths are unstable across SDK versions.
  // ─────────────────────────────────────────────────────────────────────────

  try {
    // Dynamically import to keep web bundle clean
    const { Asset } = await import('expo-asset');
    const FileSystem = await import('expo-file-system');
    const Sharing = await import('expo-sharing');

    // 1. Resolve & download the bundled asset into Expo's local cache
    const [asset] = await Asset.loadAsync(require('../assets/pdf/resume.pdf'));

    if (!asset.localUri) {
      throw new Error(
        'Asset localUri is null — make sure assets/pdf/resume.pdf exists and is listed in app.json assets array.'
      );
    }

    // 2. Copy to documentDirectory so it's accessible & shareable
    const destUri = `${FileSystem.documentDirectory}Krishnabharathi_Resume.pdf`;

    // Remove stale file if it exists (avoids EEXIST errors on some devices)
    const fileInfo = await FileSystem.getInfoAsync(destUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(destUri, { idempotent: true });
    }

    await FileSystem.copyAsync({
      from: asset.localUri,
      to: destUri,
    });

    // 3. Verify copy succeeded
    const destInfo = await FileSystem.getInfoAsync(destUri);
    if (!destInfo.exists) {
      throw new Error('File copy failed — destination file not found after copy.');
    }

    // 4. Share / Save via native share sheet
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(destUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or Share Resume',
        UTI: 'com.adobe.pdf', // iOS only, ignored on Android
      });
    } else {
      // Fallback: just tell the user where it was saved
      Alert.alert(
        'Resume Saved ✅',
        `Your resume has been saved to:\n${destUri}`,
        [{ text: 'OK' }]
      );
    }
  } catch (err: any) {
    // Re-throw with a clear message so the caller can show an Alert
    throw new Error(
      'Mobile download failed: ' + (err?.message ?? String(err))
    );
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { colors, isDark, toggleTheme } = useTheme();
  const [typedText, setTypedText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeNav, setActiveNav] = useState('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Responsive breakpoints
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  // ── Hire Me modal state ─────────────────────────────────────────────────
  const [hireMeModal, setHireMeModal] = useState(false);

  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Section scroll refs ─────────────────────────────────────────────────
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const headerRef = useRef<View>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const scrollToSection = useCallback((section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveNav(section);
    setIsMenuOpen(false);
    
    setTimeout(() => {
      const offset = sectionOffsets.current[section] ?? 0;
      scrollRef.current?.scrollTo({ y: offset, animated: true });
    }, 100);
  }, []);

  // ── Animation values ────────────────────────────────────────────────────
  const leftPanelOpacity = useSharedValue(0);
  const leftPanelX = useSharedValue(-30);
  const rightPanelOpacity = useSharedValue(0);
  const rightPanelX = useSharedValue(30);
  const profileScale = useSharedValue(0);
  const floatY = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);
  const dlBtnScale = useSharedValue(1);
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);
  const hirePulse = useSharedValue(1);

  useEffect(() => {
    leftPanelOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    leftPanelX.value = withDelay(200, withSpring(0, { damping: 15 }));
    rightPanelOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    rightPanelX.value = withDelay(400, withSpring(0, { damping: 15 }));
    profileScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 100 }));

    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ), -1, true,
    );
    glowOpacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 1500 }), withTiming(0.3, { duration: 1500 })),
      -1, true,
    );
    headerOpacity.value = withDelay(50, withTiming(1, { duration: 500 }));
    headerY.value = withDelay(50, withSpring(0, { damping: 15 }));

    hirePulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ), -1, true,
    );
  }, []);

  // ── Typing animation ────────────────────────────────────────────────────
  useEffect(() => {
    const currentRole = TYPING_ROLES[roleIndex];
    typingTimer.current = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentRole.length) {
          setTypedText(currentRole.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(typedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setRoleIndex(prev => (prev + 1) % TYPING_ROLES.length);
        }
      }
    }, isDeleting ? 60 : 100);
    return () => clearTimeout(typingTimer.current);
  }, [typedText, isDeleting, roleIndex]);

  // ── Animated styles ─────────────────────────────────────────────────────
  const leftPanelStyle = useAnimatedStyle(() => ({
    opacity: leftPanelOpacity.value,
    transform: [{ translateX: leftPanelX.value }],
  }));
  
  const rightPanelStyle = useAnimatedStyle(() => ({
    opacity: rightPanelOpacity.value,
    transform: [{ translateX: rightPanelX.value }],
  }));
  
  const profileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profileScale.value }, { translateY: floatY.value }],
  }));
  
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const dlBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: dlBtnScale.value }] }));
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));
  const hirePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: hirePulse.value }],
  }));

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleResumeDownload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dlBtnScale.value = withSequence(
      withSpring(0.95, { damping: 5 }),
      withSpring(1, { damping: 8 }),
    );
    setIsDownloading(true);
    try {
      await downloadResume();
    } catch (err: any) {
      Alert.alert(
        'Download Failed ❌',
        'Make sure assets/pdf/resume.pdf exists in your project.\n\nError: ' + (err?.message ?? ''),
        [{ text: 'OK' }],
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleHireMe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setHireMeModal(true);
    setIsMenuOpen(false);
  };

  const NAV_ITEMS = [
    { label: 'Home', section: 'Home' },
    { label: 'About', section: 'About' },
    { label: 'Skills', section: 'Skills' },
    { label: 'Projects', section: 'Projects' },
    { label: 'Experience', section: 'Experience' },
    { label: 'Contact', section: 'Contact' },
  ];

  // Responsive styles
  const responsiveStyles = {
    headerPadding: getResponsiveValue(16, 20, 24, width),
    headerHeight: getResponsiveValue(60, 70, 80, width),
    heroMinHeight: getResponsiveValue(500, 450, 500, width),
    nameFontSize: getResponsiveValue(24, 32, 40, width),
    lastNameFontSize: getResponsiveValue(12, 16, 20, width),
    roleFontSize: getResponsiveValue(16, 20, 24, width),
    taglineFontSize: getResponsiveValue(14, 14, 16, width),
    profileSize: getResponsiveValue(100, 120, 140, width),
    glowSize: getResponsiveValue(140, 160, 200, width),
    contentMaxWidth: getResponsiveValue(400, 500, 600, width),
    ctaButtonHeight: getResponsiveValue(48, 50, 52, width),
    sectionGap: getResponsiveValue(30, 50, 80, width),
  };

  // Mobile menu background: solid card color, no blur
  const mobileMenuBg = isDark ? '#1A1A2E' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient
        colors={isDark
          ? ['#0D0D0D', '#1A0A2E', '#0D1A0D']
          : ['#F5F5F7', '#EEE8FF', '#EEFFF8']}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <Animated.View
        ref={headerRef}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeaderHeight(height);
        }}
        style={[
          styles.header,
          headerStyle,
          {
            backgroundColor: isDark ? 'rgba(13,13,13,0.95)' : 'rgba(245,245,247,0.95)',
            paddingHorizontal: responsiveStyles.headerPadding,
            height: responsiveStyles.headerHeight,
            paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 20,
          }
        ]}
      >
        {/* Logo */}
        <Pressable
          style={styles.headerLeft}
          onPress={() => scrollToSection('Home')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <LinearGradient
            colors={['#7F5AF0', '#2CB67D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.logoGradient, { width: isMobile ? 36 : 40, height: isMobile ? 36 : 40 }]}
          >
            <Text style={[styles.logoText, { fontSize: isMobile ? 18 : 20 }]}>KB</Text>
          </LinearGradient>
          {!isMobile && (
            <Text style={[styles.logoName, { color: colors.text, fontSize: isMobile ? 14 : 16 }]}>
              Krishnabharathi
            </Text>
          )}
        </Pressable>

        {/* Desktop Navigation */}
        {isDesktop && (
          <View style={styles.navContainer}>
            {NAV_ITEMS.map((item) => (
              <Pressable
                key={item.label}
                style={[styles.navItem, activeNav === item.label && styles.navItemActive]}
                onPress={() => scrollToSection(item.section)}
              >
                <Text style={[
                  styles.navText,
                  { color: activeNav === item.label ? colors.accent : colors.textSecondary },
                ]}>
                  {item.label}
                </Text>
                {activeNav === item.label && (
                  <LinearGradient
                    colors={['#7F5AF0', '#2CB67D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.navActiveIndicator}
                  />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Right section - Hire Me + Theme Toggle */}
        <View style={styles.headerRight}>
          {!isMobile && (
            <Animated.View style={hirePulseStyle}>
              <Pressable
                onPress={handleHireMe}
                style={styles.hireBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <LinearGradient
                  colors={['#7F5AF0', '#5E3AC9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.hireBtnGradient, { 
                    paddingHorizontal: isTablet ? 14 : 18, 
                    paddingVertical: isTablet ? 7 : 9 
                  }]}
                >
                  <Text style={[styles.hireBtnText, { fontSize: isTablet ? 13 : 14 }]}>
                    {isTablet ? '✉' : '✉ Hire Me'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}

          <Pressable
            style={[styles.themeBtn, { 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              width: isMobile ? 40 : 36,
              height: isMobile ? 40 : 36,
            }]}
            onPress={toggleTheme}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: isMobile ? 20 : 18 }}>{isDark ? '☀️' : '🌙'}</Text>
          </Pressable>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Pressable
              style={[styles.menuBtn, { backgroundColor: colors.card }]}
              onPress={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Text style={{ fontSize: 24, color: colors.text }}>
                {isMenuOpen ? '✕' : '☰'}
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* ── Mobile Menu Dropdown — solid bg, no blur ─────────────────────── */}
      {isMobile && isMenuOpen && (
        <View
          style={[
            styles.mobileMenu,
            {
              backgroundColor: mobileMenuBg,
              top: headerHeight,
              borderBottomColor: colors.border,
              borderTopColor: colors.border,
            }
          ]}
        >
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              style={[
                styles.mobileMenuItem,
                { borderBottomColor: colors.border },
                activeNav === item.label && { backgroundColor: '#7F5AF020' }
              ]}
              onPress={() => scrollToSection(item.section)}
            >
              <Text style={[
                styles.mobileMenuText,
                { 
                  color: activeNav === item.label ? '#7F5AF0' : colors.text,
                  fontWeight: activeNav === item.label ? '700' : '500',
                }
              ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.mobileMenuItem, { borderBottomColor: 'transparent' }]}
            onPress={handleHireMe}
          >
            <Text style={[styles.mobileMenuText, { color: '#7F5AF0', fontWeight: '700' }]}>
              ✉ Hire Me
            </Text>
          </Pressable>
        </View>
      )}

      {/* Overlay when menu is open */}
      {isMobile && isMenuOpen && (
        <Pressable
          style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
          onPress={() => setIsMenuOpen(false)}
        />
      )}

      {/* ── Scrollable content ──────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: headerHeight + 10 }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <View
          onLayout={(e) => {
            sectionOffsets.current['Home'] = e.nativeEvent.layout.y;
          }}
        >
          <View style={[
            styles.splitContainer,
            {
              flexDirection: isMobile ? 'column-reverse' : 'row',
              paddingHorizontal: isMobile ? 20 : 40,
              gap: isMobile ? 30 : 40,
              minHeight: responsiveStyles.heroMinHeight,
            }
          ]}>
            {/* LEFT - Content */}
            <Animated.View style={[
              styles.leftHalf,
              leftPanelStyle,
              {
                flex: isMobile ? undefined : 1,
                alignItems: 'center',
                width: isMobile ? '100%' : undefined,
              }
            ]}>
              <View style={[
                styles.leftContent,
                {
                  maxWidth: responsiveStyles.contentMaxWidth,
                  alignItems: 'center',
                  width: '100%',
                }
              ]}>
                <Text style={[
                  styles.name,
                  {
                    color: colors.text,
                    fontSize: responsiveStyles.nameFontSize,
                    textAlign: 'center',
                  }
                ]}>
                  KRISHNABHARATHI
                </Text>
                
                <Text style={[
                  styles.lastName,
                  {
                    color: colors.textSecondary,
                    fontSize: responsiveStyles.lastNameFontSize,
                    textAlign: 'center',
                  }
                ]}>
                  SAKTHIVEL
                </Text>

                <View style={[styles.roleRow, { justifyContent: 'center' }]}>
                  <Text style={[
                    styles.roleText,
                    {
                      color: colors.accent,
                      fontSize: responsiveStyles.roleFontSize,
                    }
                  ]}>
                    {typedText}
                  </Text>
                  <View style={[
                    styles.cursor,
                    { 
                      backgroundColor: colors.accent,
                      height: responsiveStyles.roleFontSize * 0.9,
                    }
                  ]} />
                </View>

                <Text style={[
                  styles.tagline,
                  {
                    color: colors.textMuted,
                    fontSize: responsiveStyles.taglineFontSize,
                    textAlign: 'center',
                    paddingHorizontal: isMobile ? 10 : 0,
                  }
                ]}>
                  Building Scalable, Secure & High-Performance Web Applications
                </Text>

                <View style={[styles.ctaContainer, { width: '100%' }]}>
                  {/* Download Resume Button */}
                  <Animated.View style={[styles.primaryCta, dlBtnStyle, { width: '100%' }]}>
                    <Pressable
                      onPress={handleResumeDownload}
                      disabled={isDownloading}
                      style={[styles.btnPrimary, isDownloading && { opacity: 0.75 }]}
                    >
                      <LinearGradient
                        colors={isDownloading ? ['#444', '#333'] : ['#7F5AF0', '#5E3AC9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.btnGradient, { height: responsiveStyles.ctaButtonHeight }]}
                      >
                        {isDownloading ? (
                          <View style={styles.btnRow}>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={[styles.btnPrimaryText, { fontSize: isMobile ? 14 : 15 }]}>
                              Preparing...
                            </Text>
                          </View>
                        ) : (
                          <Text style={[styles.btnPrimaryText, { fontSize: isMobile ? 14 : 15 }]}>
                            ⬇ Download Resume
                          </Text>
                        )}
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>

                  {/* Secondary Buttons */}
                  <View style={[
                    styles.secondaryCtaRow,
                    {
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 12 : 16,
                    }
                  ]}>
                    <Pressable
                      onPress={() => scrollToSection('Projects')}
                      style={[
                        styles.btnSecondary,
                        {
                          borderColor: colors.accent,
                          backgroundColor: colors.card,
                          height: responsiveStyles.ctaButtonHeight,
                          flex: isMobile ? undefined : 1,
                          width: isMobile ? '100%' : undefined,
                        }
                      ]}
                    >
                      <Text style={[styles.btnSecondaryText, { 
                        color: colors.accent, 
                        fontSize: isMobile ? 14 : 15 
                      }]}>
                        ◫ View Projects
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={handleHireMe}
                      style={[
                        styles.btnOutline,
                        {
                          borderColor: colors.accentSecondary,
                          height: responsiveStyles.ctaButtonHeight,
                          flex: isMobile ? undefined : 1,
                          width: isMobile ? '100%' : undefined,
                        }
                      ]}
                    >
                      <Text style={[styles.btnOutlineText, { 
                        color: colors.accentSecondary, 
                        fontSize: isMobile ? 14 : 15 
                      }]}>
                        ✉ Contact Me
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* RIGHT - Profile Avatar */}
            <Animated.View style={[
              styles.rightHalf,
              rightPanelStyle,
              {
                flex: isMobile ? undefined : 1,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: isMobile ? 20 : 0,
              }
            ]}>
              <View style={styles.profileSection}>
                <Animated.View
                  style={[
                    styles.glowRing,
                    glowStyle,
                    {
                      width: responsiveStyles.glowSize,
                      height: responsiveStyles.glowSize,
                      borderRadius: responsiveStyles.glowSize / 2,
                      top: (responsiveStyles.profileSize - responsiveStyles.glowSize) / 2,
                    }
                  ]}
                />
                <Animated.View style={[styles.profileWrapper, profileStyle]}>
                  <LinearGradient
                    colors={['#7F5AF0', '#2CB67D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.profileBorder,
                      {
                        width: responsiveStyles.profileSize + 8,
                        height: responsiveStyles.profileSize + 8,
                        borderRadius: (responsiveStyles.profileSize + 8) / 2,
                      }
                    ]}
                  >
                    <View style={[
                      styles.profileInner,
                      {
                        backgroundColor: colors.surface,
                        width: responsiveStyles.profileSize,
                        height: responsiveStyles.profileSize,
                        borderRadius: responsiveStyles.profileSize / 2,
                      }
                    ]}>
                      <Text style={[styles.profileInitials, { 
                        fontSize: responsiveStyles.profileSize * 0.35,
                        color: colors.accent,
                      }]}>
                        KB
                      </Text>
                    </View>
                  </LinearGradient>
                </Animated.View>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Other Sections */}
        <View
          onLayout={(e) => { sectionOffsets.current['About'] = e.nativeEvent.layout.y; }}
          style={{ marginTop: responsiveStyles.sectionGap }}
        >
          <About />
        </View>

        <View
          onLayout={(e) => { sectionOffsets.current['Skills'] = e.nativeEvent.layout.y; }}
          style={{ marginTop: responsiveStyles.sectionGap }}
        >
          <Skills />
        </View>

        <View
          onLayout={(e) => { sectionOffsets.current['Projects'] = e.nativeEvent.layout.y; }}
          style={{ marginTop: responsiveStyles.sectionGap }}
        >
          <Projects />
        </View>

        <View
          onLayout={(e) => { sectionOffsets.current['Experience'] = e.nativeEvent.layout.y; }}
          style={{ marginTop: responsiveStyles.sectionGap }}
        >
          <Experience />
        </View>

        <View
          onLayout={(e) => { sectionOffsets.current['Contact'] = e.nativeEvent.layout.y; }}
          style={{ marginTop: responsiveStyles.sectionGap }}
        >
          <Contact />
        </View>

        <NavBar />
      </ScrollView>

      {/* Mobile Hire Me Floating Button */}
      {isMobile && (
        <Pressable
          style={[styles.floatingHireBtn, { backgroundColor: colors.accent }]}
          onPress={handleHireMe}
        >
          <Text style={styles.floatingHireBtnText}>✉</Text>
        </Pressable>
      )}

      {/* Hire Me Modal */}
      <EmailComposeModal
        visible={hireMeModal}
        onClose={() => setHireMeModal(false)}
        toEmail={HIRE_ME_EMAIL}
        defaultSubject={HIRE_ME_SUBJECT}
        defaultBody={HIRE_ME_BODY}
        accentColor="#7F5AF0"
        modalTitle="Hire Krishnabharathi"
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    paddingBottom: 100,
  },

  // Header Styles
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127,90,240,0.15)',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  logoGradient: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    fontWeight: '800',
    color: '#FFFFFF',
  },

  logoName: {
    fontWeight: '600',
  },

  // Desktop Navigation
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  navItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },

  navItemActive: {
    backgroundColor: 'rgba(127, 90, 240, 0.1)',
  },

  navText: {
    fontSize: 14,
    fontWeight: '500',
  },

  navActiveIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
  },

  // Header Right
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  hireBtn: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#7F5AF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  hireBtnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  hireBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  themeBtn: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  // Mobile Menu
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mobileMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },

  mobileMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  mobileMenuText: {
    fontSize: 16,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },

  // Split Container
  splitContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  leftHalf: {
    justifyContent: 'center',
    paddingVertical: 20,
  },

  rightHalf: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  leftContent: {
    gap: 12,
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  glowRing: {
    position: 'absolute',
    backgroundColor: 'rgba(127, 90, 240, 0.2)',
  },

  profileWrapper: {
    shadowColor: '#7F5AF0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },

  profileBorder: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileInner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  profileInitials: {
    fontWeight: '900',
  },

  // Text Styles
  name: {
    fontWeight: '900',
    letterSpacing: 3,
  },

  lastName: {
    fontWeight: '300',
    letterSpacing: 6,
    marginTop: -2,
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    marginTop: 8,
  },

  roleText: {
    fontWeight: '600',
    letterSpacing: 1,
  },

  cursor: {
    width: 2,
    borderRadius: 1,
  },

  tagline: {
    letterSpacing: 1,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 24,
  },

  // CTA Buttons
  ctaContainer: {
    gap: 16,
    marginTop: 32,
  },

  primaryCta: {
    shadowColor: '#7F5AF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  btnPrimary: {
    borderRadius: 14,
    overflow: 'hidden',
  },

  btnGradient: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  secondaryCtaRow: {
    width: '100%',
  },

  btnSecondary: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnSecondaryText: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  btnOutline: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnOutlineText: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Floating Button
  floatingHireBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7F5AF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
  },

  floatingHireBtnText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
});
