// src/components/GlassCard.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
}

export const GlassCard: React.FC<Props> = ({ children, style, intensity = 20, noPadding = false }) => {
  const { isDark } = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.blur, noPadding ? {} : styles.padding]}
      >
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blur: {
    width: '100%',
  },
  padding: {
    padding: 16,
  },
});
