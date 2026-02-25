// src/components/UI.tsx — Reusable UI building blocks
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '../theme/theme';

// ─── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow, title, subtitle, centered = false,
}) => {
  const { colors } = useTheme();
  const align = centered ? 'center' : 'flex-start';

  return (
    <View style={[styles.sectionHeader, { alignItems: align }]}>
      {eyebrow && (
        <View style={[styles.eyebrowRow, centered && { justifyContent: 'center' }]}>
          <View style={[styles.eyebrowLine, { backgroundColor: colors.accent }]} />
          <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text>
        </View>
      )}
      <Text style={[styles.sectionTitle, { color: colors.text, textAlign: centered ? 'center' : 'left' }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, textAlign: centered ? 'center' : 'left' }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, padded = true, onPress }) => {
  const { colors } = useTheme();

  const inner = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          ...SHADOW.md,
        },
        padded && styles.cardPadded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}>{inner}</Pressable>;
  }
  return inner;
};

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, color, bgColor, size = 'sm' }) => {
  const { colors } = useTheme();
  const textColor = color ?? colors.accent;
  const bg = bgColor ?? colors.accentLight;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.badgeText, { color: textColor }, size === 'md' && styles.badgeTextMd]}>
        {label}
      </Text>
    </View>
  );
};

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }, style]} />;
};

// ─── Tag Row ──────────────────────────────────────────────────────────────────
export const TechTagRow: React.FC<{ tags: string[]; color?: string }> = ({ tags, color }) => {
  const { colors } = useTheme();
  const tagColor = color ?? colors.accent;

  return (
    <View style={styles.tagRow}>
      {tags.map((tag) => (
        <View
          key={tag}
          style={[
            styles.techTag,
            {
              backgroundColor: `${tagColor}12`,
              borderColor: `${tagColor}30`,
            },
          ]}
        >
          <Text style={[styles.techTagText, { color: tagColor }]}>{tag}</Text>
        </View>
      ))}
    </View>
  );
};

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: string;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  label, onPress, variant = 'primary', icon, style, disabled, loading, size = 'md',
}) => {
  const { colors } = useTheme();

  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        size === 'lg' && styles.buttonLg,
        isPrimary && { backgroundColor: colors.accent },
        isOutline && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.accent },
        !isPrimary && !isOutline && { backgroundColor: 'transparent' },
        pressed && { opacity: 0.82 },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : colors.accent} size="small" />
      ) : (
        <View style={styles.buttonInner}>
          {icon && <Text style={styles.buttonIcon}>{icon}</Text>}
          <Text
            style={[
              styles.buttonText,
              size === 'sm' && styles.buttonTextSm,
              size === 'lg' && styles.buttonTextLg,
              { color: isPrimary ? '#FFFFFF' : colors.accent },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...SHADOW.sm }]}>
      <Text style={[styles.statValue, { color: colors.accent }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
};

// ─── Back Button ──────────────────────────────────────────────────────────────
export const BackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border, ...SHADOW.sm }]}
    >
      <Text style={[styles.backBtnText, { color: colors.text }]}>←</Text>
    </Pressable>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { useEffect } from 'react';

export const ProgressBar: React.FC<{
  level: number;
  color: string;
  delay?: number;
}> = ({ level, color, delay = 0 }) => {
  const { colors } = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(delay, withTiming(level, { duration: 900 }));
  }, [level]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
      <Animated.View style={[styles.progressFill, { backgroundColor: color }, barStyle]} />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sectionHeader: { gap: 8, marginBottom: 28 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrowLine: { width: 24, height: 2, borderRadius: 2 },
  eyebrow: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    letterSpacing: -0.5,
    lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.2,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.6,
    marginTop: 4,
    maxWidth: 520,
  },

  card: {
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  cardPadded: { padding: SPACING[5] },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeMd: { paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 0.5 },
  badgeTextMd: { fontSize: TYPOGRAPHY.sizes.sm },

  divider: { height: 1, width: '100%' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  techTagText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },

  button: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[5],
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSm: { paddingHorizontal: SPACING[4], paddingVertical: 9 },
  buttonLg: { paddingHorizontal: SPACING[8], paddingVertical: 16 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonIcon: { fontSize: 16 },
  buttonText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 0.3 },
  buttonTextSm: { fontSize: TYPOGRAPHY.sizes.xs },
  buttonTextLg: { fontSize: TYPOGRAPHY.sizes.base },

  statCard: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
    minWidth: 72,
    gap: 4,
  },
  statValue: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.black, letterSpacing: -0.5 },
  statLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.medium, textAlign: 'center' },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 18, lineHeight: 22 },

  progressTrack: {
    height: 5,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
});
