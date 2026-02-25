// src/components/NavBar.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';

const TABS = [
  { label: 'Home', icon: '⬡', route: '/home' },
  { label: 'About', icon: '◎', route: '/about' },
  { label: 'Skills', icon: '◈', route: '/skills' },
  { label: 'Projects', icon: '◫', route: '/projects' },
  { label: 'Contact', icon: '◉', route: '/contact' },
];

export const NavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, colors } = useTheme();

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
        <View style={styles.row}>
          {TABS.map((tab) => {
            const active = pathname === tab.route;
            return (
              <Pressable
                key={tab.route}
                style={styles.tab}
                onPress={() => router.push(tab.route as any)}
              >
                <View style={[styles.iconContainer, active && { backgroundColor: colors.accent }]}>
                  <Text style={styles.icon}>{tab.icon}</Text>
                </View>
                <Text style={[styles.label, { color: active ? colors.accent : colors.textMuted }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  blur: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
