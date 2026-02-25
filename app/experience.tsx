// app/experience.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/theme/ThemeContext';
import { PORTFOLIO_DATA } from '../src/data/portfolio';

// ─────────────────────────────────────────────────────────────────────────────
// Responsive helpers
// ─────────────────────────────────────────────────────────────────────────────
const responsive = {
  fs: (w: number, mobile: number, tablet: number, desktop: number) =>
    w < 768 ? mobile : w < 1024 ? tablet : desktop,
  sp: (w: number, mobile: number, tablet: number, desktop: number) =>
    w < 768 ? mobile : w < 1024 ? tablet : desktop,
  isMobile: (w: number) => w < 768,
  isTablet: (w: number) => w >= 768 && w < 1024,
  isDesktop: (w: number) => w >= 1024,
  containerPad: (w: number) => (w < 768 ? 16 : w < 1024 ? 28 : 48),
  cardPad: (w: number) => (w < 768 ? 14 : w < 1024 ? 18 : 22),
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD — used in all layouts
// ─────────────────────────────────────────────────────────────────────────────
const ExperienceCard: React.FC<{
  exp: any;
  index: number;
  colors: any;
  width: number;
  animDelay?: number;
}> = ({ exp, index, colors, width, animDelay = 0 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const dotScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(animDelay, withTiming(1, { duration: 550 }));
    translateY.value = withDelay(animDelay, withSpring(0, { damping: 16 }));
    dotScale.value = withDelay(animDelay + 200, withSpring(1, { damping: 10 }));
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400 }),
        withTiming(0.25, { duration: 1400 })
      ),
      -1,
      true
    );
  }, []);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const dotAnim = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const glowAnim = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const PALETTE = ['#7F5AF0', '#2CB67D', '#FF6B6B', '#F5A623', '#4ECDC4'];
  const accent = PALETTE[index % PALETTE.length];

  const cardPad = responsive.cardPad(width);
  const isMobile = responsive.isMobile(width);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          padding: cardPad,
        },
        cardAnim,
      ]}
    >
      {/* Gradient tint */}
      <LinearGradient
        colors={[`${accent}14`, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Top row: badge + dot indicator */}
      <View style={styles.cardTopRow}>
        <View style={[styles.typeBadge, { backgroundColor: `${accent}1E` }]}>
          <Text style={[styles.typeText, { color: accent, fontSize: responsive.fs(width, 9, 10, 11) }]}>
            {exp.type}
          </Text>
        </View>
        {/* Animated glow dot */}
        <Animated.View style={[styles.glowDotWrapper, dotAnim]}>
          <Animated.View style={[styles.glowDot, { backgroundColor: accent }, glowAnim]} />
          <LinearGradient colors={['#7F5AF0', '#2CB67D']} style={styles.innerDot} />
        </Animated.View>
      </View>

      {/* Role + Company */}
      <Text
        style={[
          styles.expRole,
          {
            color: colors.text,
            fontSize: responsive.fs(width, 14, 16, 18),
            marginTop: 6,
          },
        ]}
      >
        {exp.role}
      </Text>
      <Text
        style={[
          styles.expCompany,
          {
            color: accent,
            fontSize: responsive.fs(width, 12, 13, 14),
          },
        ]}
      >
        {exp.company}
      </Text>
      <Text
        style={[
          styles.expPeriod,
          {
            color: colors.textMuted,
            fontSize: responsive.fs(width, 10, 11, 12),
            marginBottom: responsive.sp(width, 6, 8, 10),
          },
        ]}
      >
        {exp.period} · {exp.duration}
      </Text>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: `${accent}30` }]} />

      {/* Description */}
      <Text
        style={[
          styles.expDesc,
          {
            color: colors.textSecondary,
            fontSize: responsive.fs(width, 11, 12, 13),
            lineHeight: responsive.fs(width, 17, 19, 21),
            marginVertical: responsive.sp(width, 6, 8, 10),
          },
        ]}
      >
        {exp.description}
      </Text>

      {/* Highlights */}
      <View style={{ gap: responsive.sp(width, 4, 5, 6) }}>
        {exp.highlights.map((h: string, i: number) => (
          <View key={i} style={styles.highlightRow}>
            <LinearGradient
              colors={[accent, `${accent}80`]}
              style={[
                styles.highlightDot,
                { marginTop: responsive.fs(width, 5, 6, 7) },
              ]}
            />
            <Text
              style={[
                styles.highlightText,
                {
                  color: colors.textSecondary,
                  fontSize: responsive.fs(width, 10, 11, 12),
                  lineHeight: responsive.fs(width, 16, 18, 20),
                },
              ]}
            >
              {h}
            </Text>
          </View>
        ))}
      </View>

      {/* Tech tags */}
      <View
        style={[
          styles.techRow,
          { marginTop: responsive.sp(width, 8, 10, 12) },
        ]}
      >
        {exp.tech.map((t: string) => (
          <View
            key={t}
            style={[
              styles.techTag,
              {
                backgroundColor: `${accent}12`,
                borderColor: `${accent}30`,
                paddingHorizontal: isMobile ? 7 : 10,
                paddingVertical: isMobile ? 2 : 4,
              },
            ]}
          >
            <Text
              style={[
                styles.techTagText,
                {
                  color: accent,
                  fontSize: responsive.fs(width, 9, 10, 11),
                },
              ]}
            >
              {t}
            </Text>
          </View>
        ))}
      </View>

      {/* Website */}
      {exp.website ? (
        <Pressable
          onPress={() => Linking.openURL(exp.website)}
          style={({ pressed }) => [
            styles.websiteBtn,
            {
              borderColor: `${accent}60`,
              marginTop: responsive.sp(width, 8, 10, 12),
              paddingVertical: isMobile ? 7 : 10,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.websiteBtnText,
              {
                color: accent,
                fontSize: responsive.fs(width, 11, 12, 13),
              },
            ]}
          >
            🌐  Visit Website
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE TIMELINE — single column with left line
// ─────────────────────────────────────────────────────────────────────────────
const MobileTimeline: React.FC<{ colors: any; width: number }> = ({ colors, width }) => {
  const PALETTE = ['#7F5AF0', '#2CB67D', '#FF6B6B', '#F5A623', '#4ECDC4'];

  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Vertical line */}
      <View
        style={[
          styles.mobileLineTrack,
          { backgroundColor: colors.border, left: 27 },
        ]}
      />

      {PORTFOLIO_DATA.experience.map((exp, i) => {
        const accent = PALETTE[i % PALETTE.length];
        return (
          <View key={exp.id} style={styles.mobileRow}>
            {/* Left icon column */}
            <View style={styles.mobileIconCol}>
              <LinearGradient
                colors={[accent, `${accent}70`]}
                style={styles.mobileIcon}
              >
                <Text style={{ fontSize: 14 }}>💼</Text>
              </LinearGradient>
            </View>

            {/* Card */}
            <View style={{ flex: 1, paddingLeft: 12, paddingBottom: 20 }}>
              <ExperienceCard
                exp={exp}
                index={i}
                colors={colors}
                width={width}
                animDelay={i * 150}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLET/DESKTOP TIMELINE — classic alternating two-column
// ─────────────────────────────────────────────────────────────────────────────
const DesktopTimeline: React.FC<{ colors: any; width: number }> = ({ colors, width }) => {
  const PALETTE = ['#7F5AF0', '#2CB67D', '#FF6B6B', '#F5A623', '#4ECDC4'];
  const isDesktop = responsive.isDesktop(width);
  const cardMaxWidth = isDesktop ? 480 : 360;

  return (
    <View style={{ paddingHorizontal: responsive.containerPad(width) }}>
      {/* Center spine */}
      <View
        style={[
          styles.desktopSpine,
          { backgroundColor: colors.border },
        ]}
      />

      {PORTFOLIO_DATA.experience.map((exp, i) => {
        const isLeft = i % 2 === 0;
        const accent = PALETTE[i % PALETTE.length];

        return (
          <View
            key={exp.id}
            style={[
              styles.desktopRow,
              { marginBottom: isDesktop ? 32 : 24 },
            ]}
          >
            {/* LEFT SIDE */}
            <View style={[styles.desktopSide, { alignItems: 'flex-end' }]}>
              {isLeft ? (
                <View style={{ width: '100%', maxWidth: cardMaxWidth }}>
                  <ExperienceCard
                    exp={exp}
                    index={i}
                    colors={colors}
                    width={width}
                    animDelay={i * 180}
                  />
                </View>
              ) : (
                // Year label on right side items
                <Text
                  style={[
                    styles.yearLabel,
                    {
                      color: colors.textMuted,
                      fontSize: responsive.fs(width, 11, 12, 13),
                    },
                  ]}
                >
                  {exp.period.split(' – ')[0]}
                </Text>
              )}
            </View>

            {/* CENTER NODE */}
            <View style={styles.desktopCenter}>
              <LinearGradient
                colors={[accent, `${accent}80`]}
                style={[
                  styles.centerNode,
                  {
                    width: isDesktop ? 44 : 36,
                    height: isDesktop ? 44 : 36,
                    borderRadius: isDesktop ? 22 : 18,
                  },
                ]}
              >
                <Text style={{ fontSize: isDesktop ? 18 : 14 }}>💼</Text>
              </LinearGradient>
            </View>

            {/* RIGHT SIDE */}
            <View style={[styles.desktopSide, { alignItems: 'flex-start' }]}>
              {!isLeft ? (
                <View style={{ width: '100%', maxWidth: cardMaxWidth }}>
                  <ExperienceCard
                    exp={exp}
                    index={i}
                    colors={colors}
                    width={width}
                    animDelay={i * 180}
                  />
                </View>
              ) : (
                <Text
                  style={[
                    styles.yearLabel,
                    {
                      color: colors.textMuted,
                      fontSize: responsive.fs(width, 11, 12, 13),
                    },
                  ]}
                >
                  {exp.period.split(' – ')[0]}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function ExperienceScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = responsive.isMobile(width);
  const containerPad = responsive.containerPad(width);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={
          isDark
            ? ['#0D0D0D', '#1A100A', '#0D0D0D']
            : ['#F5F5F7', '#FFF8EE', '#F5F5F7']
        }
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: isMobile ? 8 : 16, paddingBottom: 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textMuted,
              fontSize: responsive.fs(width, 12, 13, 14),
              marginBottom: isMobile ? 24 : 40,
              letterSpacing: 0.5,
            },
          ]}
        >
          Professional journey &amp; key contributions
        </Text>

        {/* Responsive layout switch */}
        {isMobile ? (
          <MobileTimeline colors={colors} width={width} />
        ) : (
          <DesktopTimeline colors={colors} width={width} />
        )}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { paddingBottom: 20 },
  subtitle: { textAlign: 'center' },

  // Card
  card: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeText: { fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  glowDotWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  innerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  expRole: { fontWeight: '800', letterSpacing: 0.2 },
  expCompany: { fontWeight: '700' },
  expPeriod: {},
  divider: { height: 1, borderRadius: 1 },
  expDesc: {},
  highlightRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  highlightDot: { width: 5, height: 5, borderRadius: 2.5, flexShrink: 0 },
  highlightText: { flex: 1 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techTag: { borderRadius: 10, borderWidth: 1 },
  techTagText: { fontWeight: '700', letterSpacing: 0.3 },
  websiteBtn: { borderWidth: 1, borderRadius: 10, alignItems: 'center' },
  websiteBtnText: { fontWeight: '600' },

  // Mobile timeline
  mobileLineTrack: {
    position: 'absolute',
    width: 2,
    top: 16,
    bottom: 0,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mobileIconCol: {
    width: 54,
    alignItems: 'center',
    paddingTop: 14,
    flexShrink: 0,
  },
  mobileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  // Desktop timeline
  desktopSpine: {
    position: 'absolute',
    width: 2,
    top: 0,
    bottom: 0,
    left: '50%',
    marginLeft: -1,
    zIndex: 0,
  },
  desktopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  desktopSide: {
    flex: 1,
    paddingHorizontal: 16,
  },
  desktopCenter: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    flexShrink: 0,
  },
  centerNode: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7F5AF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  yearLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.6,
    paddingHorizontal: 8,
  },
});
