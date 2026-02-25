// app/skills.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Animated as RNAnimated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Polygon,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import { useTheme } from '../src/theme/ThemeContext';
import { PORTFOLIO_DATA } from '../src/data/portfolio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive sizing utilities
const isTablet = SCREEN_WIDTH >= 768;
const isDesktop = SCREEN_WIDTH >= 1024;

// Responsive spacing
const getResponsiveSpacing = (mobile: number, tablet?: number, desktop?: number) => {
  if (isDesktop && desktop) return desktop;
  if (isTablet && tablet) return tablet;
  return mobile;
};

// ─────────────────────────────────────────────────────────────────────────────
// Radar Chart with Responsive Sizing
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS = 5;

interface RadarSkill { name: string; level: number; icon: string; color: string }

const RadarChart: React.FC<{ skills: RadarSkill[]; isDark: boolean }> = ({ skills, isDark }) => {
  const { width } = useWindowDimensions();
  const n = skills.length;
  if (n < 3) return null;

  // Responsive chart sizing
  const chartSize = Math.min(
    width * (isDesktop ? 0.5 : isTablet ? 0.6 : 0.9),
    isDesktop ? 700 : isTablet ? 600 : 500
  );
  const center = chartSize / 2;
  const radius = center - (isDesktop ? 120 : isTablet ? 100 : 80);
  const labelRadius = radius + (isDesktop ? 40 : isTablet ? 32 : 24);

  const gridColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
  const axisColor = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.10)';
  const labelColor = isDark ? '#aaa' : '#666';

  /** Polar → Cartesian (0° = top, clockwise) */
  function polar(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  /** SVG points string for a regular n-gon at given radius */
  function ngon(n: number, r: number, cx: number, cy: number) {
    return Array.from({ length: n }, (_, i) => {
      const p = polar(cx, cy, r, (360 / n) * i);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  const dataPolygon = skills
    .map((s, i) => {
      const p = polar(center, center, (s.level / 100) * radius, (360 / n) * i);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const dataPoints = skills.map((s, i) =>
    polar(center, center, (s.level / 100) * radius, (360 / n) * i)
  );

  // Responsive font sizes
  const iconSize = isDesktop ? 20 : isTablet ? 18 : 16;
  const nameSize = isDesktop ? 14 : isTablet ? 13 : 12;
  const levelSize = isDesktop ? 16 : isTablet ? 15 : 14;
  const gridLabelSize = isDesktop ? 12 : isTablet ? 11 : 10;

  return (
    <View style={[styles.radarWrapper, { width: chartSize, height: chartSize }]}>
      <Svg width={chartSize} height={chartSize}>
        <Defs>
          <RadialGradient id="fill" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#7F5AF0" stopOpacity="0.50" />
            <Stop offset="100%" stopColor="#2CB67D" stopOpacity="0.12" />
          </RadialGradient>
        </Defs>

        {/* Grid */}
        {Array.from({ length: LEVELS }, (_, lvl) => (
          <Polygon
            key={`g${lvl}`}
            points={ngon(n, (radius / LEVELS) * (lvl + 1), center, center)}
            fill="none"
            stroke={gridColor}
            strokeWidth={1}
          />
        ))}

        {/* Axis */}
        {skills.map((_, i) => {
          const end = polar(center, center, radius, (360 / n) * i);
          return (
            <Line
              key={`ax${i}`}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke={axisColor}
              strokeWidth={1}
            />
          );
        })}

        {/* Data Shape */}
        <Polygon
          points={dataPolygon}
          fill="url(#fill)"
          stroke="#7F5AF0"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Dots */}
        {dataPoints.map((p, i) => (
          <G key={`dot${i}`}>
            <Circle cx={p.x} cy={p.y} r={isDesktop ? 7 : isTablet ? 6 : 5} fill="#7F5AF0" opacity={0.25} />
            <Circle cx={p.x} cy={p.y} r={isDesktop ? 4.5 : isTablet ? 4 : 3.5} fill="#7F5AF0" />
            <Circle cx={p.x} cy={p.y} r={isDesktop ? 2.2 : isTablet ? 2 : 1.8} fill="#fff" />
          </G>
        ))}

        {/* Level Numbers */}
        {Array.from({ length: LEVELS }, (_, lvl) => {
          const r = (radius / LEVELS) * (lvl + 1);
          const p = polar(center, center, r, 0);
          return (
            <SvgText
              key={`lv${lvl}`}
              x={center + 8}
              y={p.y - 4}
              fontSize={gridLabelSize}
              fill={labelColor}
              opacity={0.7}
            >
              {(lvl + 1) * 20}
            </SvgText>
          );
        })}

        {/* Labels */}
        {skills.map((s, i) => {
          const angle = (360 / n) * i;
          const lp = polar(center, center, labelRadius, angle);
          const anchor =
            lp.x < center - 8
              ? 'end'
              : lp.x > center + 8
              ? 'start'
              : 'middle';

          const yOffset = isDesktop ? 16 : isTablet ? 14 : 12;

          return (
            <G key={`lbl${i}`}>
              <SvgText
                x={lp.x}
                y={lp.y - yOffset}
                textAnchor={anchor}
                fontSize={iconSize}
              >
                {s.icon}
              </SvgText>

              <SvgText
                x={lp.x}
                y={lp.y - (yOffset - 14)}
                textAnchor={anchor}
                fontSize={nameSize}
                fontWeight="600"
                fill={labelColor}
              >
                {s.name.length > 10 ? s.name.slice(0, 9) + '…' : s.name}
              </SvgText>

              <SvgText
                x={lp.x}
                y={lp.y - (yOffset - 28)}
                textAnchor={anchor}
                fontSize={levelSize}
                fontWeight="800"
                fill="#7F5AF0"
              >
                {s.level}%
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Skill row card (animated bar)
// ─────────────────────────────────────────────────────────────────────────────

const SkillCard: React.FC<{ skill: any; index: number; colors: any }> = ({ skill, index, colors }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-24);
  const progress = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    opacity.value = withDelay(index * 55, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(index * 55, withSpring(0, { damping: 14 }));
    RNAnimated.timing(progress, {
      toValue: skill.level / 100,
      duration: 900 + index * 70,
      delay: 180 + index * 55,
      useNativeDriver: false,
    }).start();
  }, []);

  const aStyle = useAnimatedStyle(() => ({ 
    opacity: opacity.value, 
    transform: [{ translateX: translateX.value }] 
  }));
  
  const barW = progress.interpolate({ 
    inputRange: [0, 1], 
    outputRange: ['0%', `${skill.level}%`] 
  });

  return (
    <Animated.View style={[styles.skillCard, { backgroundColor: colors.card, borderColor: colors.border }, aStyle]}>
      <View style={styles.skillHeader}>
        <View style={styles.skillLeft}>
          <View style={[styles.iconBg, { backgroundColor: `${skill.color}1A` }]}>
            <Text style={[styles.skillIcon, { fontSize: getResponsiveSpacing(18, 20, 22) }]}>
              {skill.icon}
            </Text>
          </View>
          <View>
            <Text style={[styles.skillName, { color: colors.text }]}>{skill.name}</Text>
            <Text style={[styles.skillCat, { color: colors.textMuted }]}>{skill.category}</Text>
          </View>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: `${skill.color}1A` }]}>
          <Text style={[styles.levelText, { color: skill.color }]}>{skill.level}%</Text>
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceElevated ?? colors.border }]}>
        <RNAnimated.View style={[styles.fill, { width: barW, backgroundColor: skill.color }]} />
      </View>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Backend', 'Frontend', 'Database', 'Tools'];

export default function SkillsScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState('All');

  const allSkills = PORTFOLIO_DATA.skills;
  const filteredSkills = activeCategory === 'All'
    ? allSkills
    : allSkills.filter(s => s.category === activeCategory);

  // Radar shows up to 8 spokes (more than 8 becomes unreadable)
  const radarSkills = filteredSkills.slice(0, 8);

  // Top 3
  const topSkills = [...allSkills].sort((a, b) => b.level - a.level).slice(0, 3);

  // Responsive layout
  const isWideScreen = isDesktop || isTablet;
  const contentPadding = getResponsiveSpacing(16, 24, 32);
  const sectionTitleSize = getResponsiveSpacing(18, 22, 26);
  const gap = getResponsiveSpacing(14, 20, 24);

  // Desktop/Tablet grid layout
  const showAsGrid = isWideScreen && filteredSkills.length > 0 && filteredSkills.length <= 8;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        contentContainerStyle={[
          styles.scroll, 
          { 
            paddingHorizontal: contentPadding,
            gap,
          }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Skills ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionTitleSize }]}>
            Top Skills
          </Text>
        </View>
        
        <View style={[styles.topRow, { gap: getResponsiveSpacing(8, 12, 16) }]}>
          {topSkills.map((s, i) => (
            <View
              key={s.name}
              style={[
                styles.topCard,
                { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border,
                  padding: getResponsiveSpacing(10, 14, 18),
                }
              ]}
            >
              <LinearGradient colors={[`${s.color}22`, 'transparent']} style={StyleSheet.absoluteFill} />
              <View style={[styles.rankBadge, { backgroundColor: s.color }]}>
                <Text style={[styles.rankText, { fontSize: getResponsiveSpacing(9, 10, 11) }]}>
                  #{i + 1}
                </Text>
              </View>
              <Text style={[styles.topIcon, { fontSize: getResponsiveSpacing(26, 32, 38) }]}>
                {s.icon}
              </Text>
              <Text style={[styles.topName, { color: colors.text, fontSize: getResponsiveSpacing(11, 13, 15) }]}>
                {s.name}
              </Text>
              <Text style={[styles.topLevel, { color: s.color, fontSize: getResponsiveSpacing(15, 18, 22) }]}>
                {s.level}%
              </Text>
            </View>
          ))}
        </View>

        {/* ── Category Tabs ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionTitleSize }]}>
            Skills Radar
          </Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={[styles.tabs, { gap: getResponsiveSpacing(6, 8, 10) }]}
        >
          {CATEGORIES.map(cat => (
            <Pressable 
              key={cat} 
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.tab, 
                {
                  backgroundColor: activeCategory === cat ? colors.accent : colors.card,
                  borderColor: activeCategory === cat ? colors.accent : colors.border,
                  paddingHorizontal: getResponsiveSpacing(14, 18, 22),
                  paddingVertical: getResponsiveSpacing(6, 8, 10),
                }
              ]}
            >
              <Text 
                style={[
                  styles.tabText, 
                  { 
                    color: activeCategory === cat ? '#fff' : colors.textSecondary,
                    fontSize: getResponsiveSpacing(12, 14, 16),
                  }
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Radar Chart or Skills Display ── */}
        <View style={styles.radarWrapper}>
          <View 
            style={[
              styles.radarCard, 
              { 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                padding: getResponsiveSpacing(16, 20, 24),
              }
            ]}
          >
            {radarSkills.length >= 3 ? (
              <>
                <View style={styles.chartContainer}>
                  <RadarChart key={activeCategory} skills={radarSkills} isDark={isDark} />
                </View>
                {filteredSkills.length > 8 && (
                  <Text style={[styles.radarNote, { color: colors.textMuted, fontSize: getResponsiveSpacing(10, 11, 12) }]}>
                    +{filteredSkills.length - 8} more skills
                  </Text>
                )}
              </>
            ) : (
              <View style={styles.noChartMessage}>
                <Text style={[styles.noChartText, { color: colors.textMuted, fontSize: getResponsiveSpacing(14, 16, 18) }]}>
                  Select a category with at least 3 skills
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Skills List (Grid or List) ── */}
        {/* {(radarSkills.length < 3 || filteredSkills.length > 0) && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionTitleSize }]}>
                {activeCategory === 'All' ? 'All Skills' : `${activeCategory} Skills`}
              </Text>
              {filteredSkills.length > 0 && (
                <Text style={[styles.skillCount, { color: colors.textMuted, fontSize: getResponsiveSpacing(12, 14, 16) }]}>
                  {filteredSkills.length} {filteredSkills.length === 1 ? 'skill' : 'skills'}
                </Text>
              )}
            </View>

            {showAsGrid ? (
              <View style={[styles.skillsGrid, { gap: getResponsiveSpacing(8, 12, 16) }]}>
                {filteredSkills.map((s, i) => (
                  <View key={`${activeCategory}-${s.name}`} style={styles.gridItem}>
                    <SkillCard skill={s} index={i} colors={colors} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.list, { gap: getResponsiveSpacing(8, 10, 12) }]}>
                {filteredSkills.map((s, i) => (
                  <SkillCard key={`${activeCategory}-${s.name}`} skill={s} index={i} colors={colors} />
                ))}
              </View>
            )}
          </>
        )} */}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  skillCount: {
    fontWeight: '500',
  },
  
  // Top Skills
  topRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  topCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    overflow: 'hidden',
    gap: 3,
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankText: {
    color: '#fff',
    fontWeight: '700',
  },
  topIcon: {
    marginTop: 8,
  },
  topName: {
    fontWeight: '600',
    textAlign: 'center',
  },
  topLevel: {
    fontWeight: '800',
  },

  // Tabs
  tabs: {
    paddingBottom: 8,
  },
  tab: {
    borderRadius: 18,
    borderWidth: 1,
  },
  tabText: {
    fontWeight: '500',
  },

  // Radar Chart
  radarWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  radarCard: {
    borderWidth: 1,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarNote: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.6,
  },
  noChartMessage: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noChartText: {
    textAlign: 'center',
    opacity: 0.6,
  },

  // Skills Grid/List
  list: {
    marginTop: 4,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  gridItem: {
    width: '48%', // Approximately half width with gap
    marginHorizontal: '1%',
  },

  // Skill card
  skillCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    width: '100%',
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillIcon: {
    // Dynamic font size
  },
  skillName: {
    fontWeight: '600',
  },
  skillCat: {
    fontSize: 10,
    marginTop: 1,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});