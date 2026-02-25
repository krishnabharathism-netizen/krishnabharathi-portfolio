// app/about.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Image,
  Linking,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '../src/theme/ThemeContext';
import { NavBar } from '../src/components/NavBar';
import { PORTFOLIO_DATA } from '../src/data/portfolio';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive sizing utility
const responsive = {
  h1: (width: number) => (width < 768 ? 28 : width < 1024 ? 32 : 36),
  h2: (width: number) => (width < 768 ? 22 : width < 1024 ? 24 : 28),
  h3: (width: number) => (width < 768 ? 18 : width < 1024 ? 20 : 22),
  body: (width: number) => (width < 768 ? 14 : width < 1024 ? 15 : 16),
  small: (width: number) => (width < 768 ? 12 : width < 1024 ? 13 : 14),
  spacing: (width: number, multiplier: number = 1) => {
    const baseSpacing = width < 768 ? 16 : width < 1024 ? 20 : 24;
    return baseSpacing * multiplier;
  },
  getColumnWidth: (width: number, columns: number, gap: number) => {
    const totalGap = gap * (columns - 1);
    return (width - totalGap - responsive.spacing(width, 2)) / columns;
  },
  containerPadding: (width: number) => (width < 768 ? 16 : width < 1024 ? 24 : 32),
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF Viewer Modal
// ─────────────────────────────────────────────────────────────────────────────
const PDFViewerModal = ({
  visible,
  onClose,
  localFileUri,
  webPdfUrl,
}: {
  visible: boolean;
  onClose: () => void;
  localFileUri: string;
  webPdfUrl: string;
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(false);
    }
  }, [visible, retryKey]);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setRetryKey((k) => k + 1);
  };

  // ── Download handler ────────────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: trigger browser download
        const link = document.createElement('a');
        link.href = webPdfUrl;
        link.download = 'Krishnabharathi_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Mobile: share/save via OS share sheet
        if (localFileUri && (await Sharing.isAvailableAsync())) {
          await Sharing.shareAsync(localFileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Download / Share Resume',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('Unavailable', 'Sharing is not available on this device.');
        }
      }
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download resume. Please try again.');
    }
  };

  // ── WebView source ──────────────────────────────────────────────────────
  // For web: embed PDF via Google Docs viewer (most reliable cross-browser)
  // For native: use local file URI directly in WebView
  const getWebViewSource = () => {
    if (Platform.OS === 'web') {
      // Use Google Docs viewer with absolute URL as fallback, or embed directly
      // Since we have the asset URL, embed it in an iframe-based HTML
      return {
        html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; background: #1a1a2e; }
      iframe, embed, object { display: block; width: 100%; height: 100%; border: none; }
    </style>
  </head>
  <body>
    <object data="${webPdfUrl}" type="application/pdf" width="100%" height="100%">
      <embed src="${webPdfUrl}" type="application/pdf" width="100%" height="100%">
        <iframe src="${webPdfUrl}" width="100%" height="100%"></iframe>
      </embed>
    </object>
  </body>
</html>`,
      };
    } else {
      // Native: use local file URI
      return { uri: localFileUri };
    }
  };

  const modalWidth = width < 768 ? width * 0.95 : width < 1024 ? width * 0.85 : width * 0.65;
  const modalHeight = width < 768 ? '90%' : '85%';
  const canRender =
    Platform.OS === 'web' ? !!webPdfUrl : !!localFileUri;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.card,
              width: modalWidth,
              height: modalHeight,
              maxWidth: 1200,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Resume</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{ color: colors.text, fontSize: 28, lineHeight: 32 }}>×</Text>
            </TouchableOpacity>
          </View>

          {/* PDF area */}
          <View style={styles.pdfContainer}>
            {loading && !error && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading Resume…
                </Text>
              </View>
            )}

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📄</Text>
                <Text style={[styles.errorText, { color: colors.text }]}>
                  Unable to load Resume
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.accent }]}
                  onPress={handleRetry}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : canRender ? (
              <WebView
                key={retryKey}
                source={getWebViewSource()}
                style={styles.webview}
                onLoad={() => setLoading(false)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setError(true);
                  setLoading(false);
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowFileAccess={true}
                allowUniversalAccessFromFileURLs={true}
                originWhitelist={['*']}
                mixedContentMode="always"
                scalesPageToFit={Platform.OS === 'android'}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.errorContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Preparing PDF…
                </Text>
              </View>
            )}
          </View>

          {/* Footer with Download button */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.downloadButton, { backgroundColor: colors.accent }]}
              onPress={handleDownload}
            >
              <LinearGradient
                colors={['#7F5AF0', '#2CB67D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.downloadGradient}
              >
                <Text style={styles.downloadButtonText}>
                  {Platform.OS === 'web' ? '⬇  Download Resume' : '⬆  Share / Save Resume'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedSection
// ─────────────────────────────────────────────────────────────────────────────
const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
};

// ─────────────────────────────────────────────────────────────────────────────
// SkillBar
// ─────────────────────────────────────────────────────────────────────────────
const SkillBar: React.FC<{ skill: string; percentage: number; delay: number }> = ({
  skill,
  percentage,
  delay,
}) => {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(percentage / 100, { duration: 1500 }));
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  return (
    <View style={styles.skillItem}>
      <View style={styles.skillHeader}>
        <Text style={[styles.skillName, { color: colors.text }]}>{skill}</Text>
        <Text style={[styles.skillPercentage, { color: colors.accent }]}>{percentage}%</Text>
      </View>
      <View style={[styles.skillBarBg, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.skillBarFill, barStyle]}>
          <LinearGradient
            colors={['#7F5AF0', '#2CB67D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow
// ─────────────────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{
  label: string;
  value: string;
  isLink?: boolean;
  onPress?: () => void;
}> = ({ label, value, isLink, onPress }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <View style={styles.infoRow}>
      <Text
        style={[styles.infoLabel, { color: colors.textSecondary }, { width: width < 768 ? 70 : 80 }]}
      >
        {label}
      </Text>
      {isLink ? (
        <Pressable onPress={onPress} style={{ flex: 1 }}>
          <Text style={[styles.infoValue, { color: colors.accent }]}>{value}</Text>
        </Pressable>
      ) : (
        <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AboutScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function AboutScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { personal } = PORTFOLIO_DATA;
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [localPdfUri, setLocalPdfUri] = useState('');
  // Web: the resolved module URL (bundler-served path)
  const [webPdfUrl, setWebPdfUrl] = useState('');

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const containerPadding = responsive.containerPadding(width);
  const bodyFontSize = responsive.body(width);
  const smallFontSize = responsive.small(width);
  const h1FontSize = responsive.h1(width);
  const h2FontSize = responsive.h2(width);
  const h3FontSize = responsive.h3(width);

  const skills = [
    { name: 'HARD WORK', percentage: 84 },
    { name: 'CREATIVITY', percentage: 97 },
    { name: 'PROBLEM SOLVING', percentage: 93 },
    { name: 'TEAM COLLABORATION', percentage: 82 },
  ];

  // ── Resolve PDF asset ────────────────────────────────────────────────────
  useEffect(() => {
    const loadPdf = async () => {
      try {
        if (Platform.OS === 'web') {
          // On web, require() returns the bundled URL string
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const uri = require('../assets/pdf/resume.pdf');
          const resolvedUrl = typeof uri === 'string' ? uri : (uri.default ?? uri.uri ?? '');
          setWebPdfUrl(resolvedUrl);
          setLocalPdfUri(resolvedUrl); // also set localPdfUri for consistency
          return;
        }

        // Native: copy bundled asset to a writable location
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const asset = Asset.fromModule(require('../assets/pdf/resume.pdf'));
        await asset.downloadAsync();

        const destUri = `${FileSystem.documentDirectory}resume.pdf`;
        const info = await FileSystem.getInfoAsync(destUri);

        if (!info.exists) {
          await FileSystem.copyAsync({ from: asset.localUri!, to: destUri });
        }

        setLocalPdfUri(destUri);
      } catch (err) {
        console.error('PDF load error:', err);
      }
    };

    loadPdf();
  }, []);

  // ── Direct download without opening modal (optional quick-download button) ──
  const handleDirectDownload = async () => {
    try {
      if (Platform.OS === 'web') {
        if (!webPdfUrl) return;
        const link = document.createElement('a');
        link.href = webPdfUrl;
        link.download = 'Krishnabharathi_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        if (!localPdfUri) {
          Alert.alert('Please wait', 'Resume is still loading, try again in a moment.');
          return;
        }
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localPdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Download / Share Resume',
            UTI: 'com.adobe.pdf',
          });
        }
      }
    } catch (err) {
      console.error('Direct download error:', err);
    }
  };

  // Dynamic styles
  const dynamicStyles = {
    container: { flex: 1 },
    scrollContent: {
      paddingHorizontal: containerPadding,
      paddingTop: containerPadding,
      paddingBottom: containerPadding * 2,
      gap: isMobile ? 16 : isTablet ? 20 : 24,
    },
    profileContainer: {
      flexDirection: isMobile ? 'column' as const : 'row' as const,
      gap: isMobile ? 16 : 24,
      alignItems: isMobile ? 'center' as const : 'flex-start' as const,
    },
    profileImageBorder: {
      width: isMobile ? 120 : isTablet ? 140 : 160,
      height: isMobile ? 120 : isTablet ? 140 : 160,
      borderRadius: isMobile ? 60 : isTablet ? 70 : 80,
    },
    profileName: {
      fontSize: h2FontSize,
      textAlign: isMobile ? 'center' as const : 'left' as const,
    },
    profileTitle: {
      fontSize: bodyFontSize,
      textAlign: isMobile ? 'center' as const : 'left' as const,
    },
    infoRowContainer: {
      flexDirection: isMobile ? 'column' as const : 'row' as const,
      gap: containerPadding,
    },
    eduCertContainer: {
      flexDirection: isMobile ? 'column' as const : 'row' as const,
      gap: containerPadding,
    },
    sectionTitle: {
      fontSize: h3FontSize,
      marginBottom: isMobile ? 12 : 16,
    },
  };

  return (
    <View style={dynamicStyles.container}>
      <LinearGradient
        colors={
          isDark
            ? ['#0D0D0D', '#1A0A2E', '#0D0D0D']
            : ['#F5F5F7', '#EEE8FF', '#F5F5F7']
        }
        style={StyleSheet.absoluteFill}
      />

      <PDFViewerModal
        visible={pdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
        localFileUri={localPdfUri}
        webPdfUrl={webPdfUrl}
      />

      <ScrollView
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <AnimatedSection delay={100}>
          <View style={dynamicStyles.profileContainer}>
            <LinearGradient
              colors={['#7F5AF0', '#2CB67D']}
              style={dynamicStyles.profileImageBorder}
            >
              <Image
                source={require('../assets/images/profile.jpeg')}
                style={styles.profileImage}
              />
            </LinearGradient>
            <View
              style={[styles.profileInfo, isMobile && { alignItems: 'center', width: '100%' }]}
            >
              <Text style={[dynamicStyles.profileName, { color: colors.text }]}>
                Krishnabharathi S
              </Text>
              <Text style={[dynamicStyles.profileTitle, { color: colors.accent }]}>
                Full Stack Developer
              </Text>
              <View style={styles.profileStats}>
                {[
                  ['6+', 'Month Exp'],
                  ['3+', 'Projects'],
                  ['2+', 'Clients'],
                ].map(([num, label], i) => (
                  <React.Fragment key={label}>
                    {i > 0 && (
                      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    )}
                    <View style={styles.statItem}>
                      <Text
                        style={[
                          styles.statNumber,
                          { color: colors.text, fontSize: h3FontSize },
                        ]}
                      >
                        {num}
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.textSecondary, fontSize: smallFontSize },
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* About Me Section */}
        <AnimatedSection delay={150}>
          <View
            style={[
              styles.descriptionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                padding: containerPadding,
              },
            ]}
          >
            <Text style={[dynamicStyles.sectionTitle, { color: colors.text }]}>About Me</Text>
            <Text
              style={[
                styles.descriptionText,
                { color: colors.textSecondary, fontSize: bodyFontSize, lineHeight: bodyFontSize * 1.6 },
              ]}
            >
              I am a highly motivated and detail-oriented Full Stack Developer with a strong
              foundation in software engineering principles and hands-on experience in building
              scalable web and mobile applications. With a Master's degree in Computer Applications
              and a background in Mathematics, I bring strong analytical thinking, problem-solving
              ability, and technical expertise to software development. My core competencies include
              Java, Spring Boot, RESTful API development, React.js, and React Native, along with
              experience in relational and NoSQL databases. I am passionate about designing efficient
              backend systems, creating responsive user interfaces, and delivering high-quality
              solutions aligned with business requirements.
              {'\n\n'}
              During my professional internship experience, I contributed to the development of a
              full-stack E-Learning platform, where I was responsible for implementing REST APIs,
              integrating secure authentication mechanisms using JWT, and ensuring seamless
              communication between frontend and backend systems. I also worked on performance
              optimization, UI responsiveness, and feature enhancements, which strengthened my
              understanding of real-world development environments, agile collaboration, and software
              lifecycle management. My exposure to tools such as Git, Postman, cloud services, and
              modern development environments has enabled me to adapt quickly to new technologies
              and workflows.
              {'\n\n'}
              I have successfully developed multiple academic and personal projects, including a
              cross-platform mobile gaming application and a comprehensive library management system.
              These projects demonstrate my ability to architect scalable applications, manage
              databases efficiently, and implement secure user management systems. I am particularly
              interested in backend engineering, system design, and integrating emerging technologies
              such as Artificial Intelligence into modern applications to create intelligent and
              user-centric solutions.
              {'\n\n'}
              As an aspiring software professional, I am seeking opportunities to contribute to
              dynamic organizations where I can leverage my technical skills, collaborate with
              cross-functional teams, and deliver impactful software products. I am committed to
              continuous learning, professional growth, and maintaining high standards of code
              quality and performance. My long-term objective is to evolve into a proficient
              software engineer capable of building robust, scalable, and innovative technology
              solutions that drive organizational success.
            </Text>
          </View>
        </AnimatedSection>

        {/* Personal Info & Skills Section */}
        <AnimatedSection delay={200}>
          <View style={dynamicStyles.infoRowContainer}>
            {/* Personal Info Card */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  padding: containerPadding,
                  flex: isMobile ? 1 : 0.4,
                },
              ]}
            >
              <Text style={[dynamicStyles.sectionTitle, { color: colors.text }]}>
                Personal Info
              </Text>
              <View style={styles.infoGrid}>
                <InfoRow label="Name:" value="Krishnabharathi S" />
                <InfoRow label="Age:" value="23 Years" />
                <InfoRow label="Location:" value="Tiruchirappalli, TN" />
                <InfoRow
                  label="Email:"
                  value="krishnabharathisakthivel@gmail.com"
                  isLink
                  onPress={() =>
                    Linking.openURL('mailto:krishnabharathisakthivel@gmail.com')
                  }
                />
                <InfoRow
                  label="Phone:"
                  value="+91 7708654719"
                  isLink
                  onPress={() => Linking.openURL('tel:+917708654719')}
                />
              </View>
            </View>

            {/* Skills Card */}
            <View
              style={[
                styles.skillsCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  padding: containerPadding,
                  flex: isMobile ? 1 : 0.6,
                },
              ]}
            >
              <Text style={[dynamicStyles.sectionTitle, { color: colors.text }]}>
                Professional Skills
              </Text>
              <View style={styles.skillsContainer}>
                {skills.map((skill, index) => (
                  <SkillBar
                    key={skill.name}
                    skill={skill.name}
                    percentage={skill.percentage}
                    delay={300 + index * 100}
                  />
                ))}
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Resume Card — VIEW + DOWNLOAD buttons */}
        <AnimatedSection delay={250}>
          <View
            style={[
              styles.resumeCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                padding: containerPadding,
                flexDirection: isMobile ? ('column' as const) : ('row' as const),
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: containerPadding / 2 }}
            >
              <LinearGradient
                colors={['#7F5AF0', '#2CB67D']}
                style={styles.resumeIconContainer}
              >
                <Text style={styles.resumeIcon}>📄</Text>
              </LinearGradient>
              <View>
                <Text style={[styles.resumeTitle, { color: colors.text, fontSize: h3FontSize }]}>
                  My Resume
                </Text>
                <Text
                  style={[
                    styles.resumeSubtitle,
                    { color: colors.textSecondary, fontSize: smallFontSize },
                  ]}
                >
                  View or download my detailed resume
                </Text>
              </View>
            </View>

            {/* Buttons row */}
            <View
              style={[
                styles.resumeButtons,
                isMobile && { width: '100%', marginTop: containerPadding / 2 },
              ]}
            >
              {/* VIEW button */}
              {/* <Pressable
                style={[styles.resumeBtn, { flex: 1 }]}
                onPress={() => setPdfModalVisible(true)}
              >
                <LinearGradient
                  colors={['#7F5AF0', '#2CB67D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.resumeBtnGradient}
                >
                  <Text style={styles.resumeBtnText}>👁  VIEW</Text>
                </LinearGradient>
              </Pressable> */}

              {/* DOWNLOAD button */}
              <Pressable
                style={[styles.resumeBtn, { flex: 1 }]}
                onPress={handleDirectDownload}
              >
                <LinearGradient
                  colors={['#2CB67D', '#7F5AF0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.resumeBtnGradient}
                >
                  <Text style={styles.resumeBtnText}>
                    {Platform.OS === 'web' ? '⬇  DOWNLOAD' : '⬆  SHARE'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </AnimatedSection>

        {/* Education & Certifications Section */}
        <AnimatedSection delay={300}>
          <View style={dynamicStyles.eduCertContainer}>
            {/* Education - B.Sc */}
            <View
              style={[
                styles.eduCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  padding: containerPadding,
                  flex: 1,
                },
              ]}
            >
              <LinearGradient
                colors={['#7F5AF0', '#2CB67D']}
                style={styles.eduIconContainer}
              >
                <Text style={styles.eduIcon}>🎓</Text>
              </LinearGradient>
              <Text style={[styles.eduTitle, { color: colors.text, fontSize: h3FontSize }]}>
                Education
              </Text>
              <View style={styles.eduContent}>
                <Text style={[styles.eduDegree, { color: colors.accent, fontSize: bodyFontSize }]}>
                  B.Sc Mathematics
                </Text>
                <Text
                  style={[
                    styles.eduInst,
                    { color: colors.textSecondary, fontSize: smallFontSize },
                  ]}
                >
                  Bachelor of Science
                </Text>
                <Text
                  style={[styles.eduYear, { color: colors.textMuted, fontSize: smallFontSize }]}
                >
                  2020 - 2023
                </Text>
                <View style={[styles.eduBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Text
                    style={[styles.eduScore, { color: colors.accent, fontSize: smallFontSize }]}
                  >
                    CGPA: 8.20/10
                  </Text>
                </View>
              </View>
            </View>

            {/* Education - M.C.A */}
            <View
              style={[
                styles.eduCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  padding: containerPadding,
                  flex: 1,
                },
              ]}
            >
              <LinearGradient
                colors={['#7F5AF0', '#2CB67D']}
                style={styles.eduIconContainer}
              >
                <Text style={styles.eduIcon}>🎓</Text>
              </LinearGradient>
              <Text style={[styles.eduTitle, { color: colors.text, fontSize: h3FontSize }]}>
                Education
              </Text>
              <View style={styles.eduContent}>
                <Text style={[styles.eduDegree, { color: colors.accent, fontSize: bodyFontSize }]}>
                  M.C.A
                </Text>
                <Text
                  style={[
                    styles.eduInst,
                    { color: colors.textSecondary, fontSize: smallFontSize },
                  ]}
                >
                  Master of Computer Applications
                </Text>
                <Text
                  style={[styles.eduYear, { color: colors.textMuted, fontSize: smallFontSize }]}
                >
                  2023 - 2025
                </Text>
                <View style={[styles.eduBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Text
                    style={[styles.eduScore, { color: colors.accent, fontSize: smallFontSize }]}
                  >
                    CGPA: 8.04/10
                  </Text>
                </View>
              </View>
            </View>

            {/* Certifications */}
            <View
              style={[
                styles.certCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  padding: containerPadding,
                  flex: 1,
                },
              ]}
            >
              <LinearGradient
                colors={['#2CB67D', '#7F5AF0']}
                style={styles.certIconContainer}
              >
                <Text style={styles.certIcon}>📜</Text>
              </LinearGradient>
              <Text style={[styles.certTitle, { color: colors.text, fontSize: h3FontSize }]}>
                Certifications
              </Text>
              <View style={styles.certContent}>
                <View style={styles.certItem}>
                  <Text
                    style={[styles.certName, { color: colors.accent, fontSize: bodyFontSize }]}
                  >
                    C &amp; Java Certified
                  </Text>
                  <Text
                    style={[
                      styles.certIssuer,
                      { color: colors.textSecondary, fontSize: smallFontSize },
                    ]}
                  >
                    T4TEQ Certified
                  </Text>
                </View>
                <View style={[styles.certDivider, { backgroundColor: colors.border }]} />
                <View style={styles.certItem}>
                  <Text
                    style={[styles.certName, { color: colors.accent, fontSize: bodyFontSize }]}
                  >
                    Cloud Computing
                  </Text>
                  <Text
                    style={[
                      styles.certIssuer,
                      { color: colors.textSecondary, fontSize: smallFontSize },
                    ]}
                  >
                    NPTEL Certified
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </AnimatedSection>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Profile
  profileImage: { width: '100%', height: '100%', borderRadius: 100 },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  statItem: { alignItems: 'center', flex: 1, minWidth: 80 },
  statNumber: { fontWeight: '800' },
  statLabel: { marginTop: 4 },
  statDivider: { width: 1, height: 30, opacity: 0.3 },

  // Cards
  descriptionCard: { borderRadius: 20, borderWidth: 1 },
  descriptionText: { lineHeight: 24 },

  // Info
  infoCard: { borderRadius: 20, borderWidth: 1 },
  infoGrid: { gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 13, flex: 1 },

  // Skills
  skillsCard: { borderRadius: 20, borderWidth: 1 },
  skillsContainer: { gap: 16 },
  skillItem: { gap: 6 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillName: { fontSize: 13, fontWeight: '600' },
  skillPercentage: { fontSize: 13, fontWeight: '700' },
  skillBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  skillBarFill: { height: '100%', borderRadius: 4, overflow: 'hidden' },

  // Resume card
  resumeCard: { borderRadius: 20, borderWidth: 1 },
  resumeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeIcon: { fontSize: 28 },
  resumeTitle: { fontWeight: '700', marginBottom: 4 },
  resumeSubtitle: { fontSize: 12 },
  resumeButtons: {
    flexDirection: 'row',
    gap: 10,
    minWidth: 220,
  },
  resumeBtn: { borderRadius: 10, overflow: 'hidden' },
  resumeBtnGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Education & Certs
  eduCard: { borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  eduIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  eduIcon: { fontSize: 28 },
  eduTitle: { fontWeight: '700', marginBottom: 12 },
  eduContent: { alignItems: 'center' },
  eduDegree: { fontWeight: '600', textAlign: 'center' },
  eduInst: { marginTop: 4, textAlign: 'center' },
  eduYear: { marginTop: 4 },
  eduBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  eduScore: { fontWeight: '600' },
  certCard: { borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  certIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  certIcon: { fontSize: 28 },
  certTitle: { fontWeight: '700', marginBottom: 12 },
  certContent: { alignItems: 'center', width: '100%' },
  certItem: { alignItems: 'center' },
  certName: { fontWeight: '600', textAlign: 'center' },
  certIssuer: { marginTop: 2 },
  certDivider: { width: 40, height: 1, marginVertical: 8 },

  // Modal
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 24, overflow: 'hidden' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfContainer: { flex: 1 },
  webview: { flex: 1, backgroundColor: 'transparent' },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  modalFooter: { padding: 16, borderTopWidth: 1 },
  downloadButton: { borderRadius: 12, overflow: 'hidden' },
  downloadGradient: { paddingVertical: 14, alignItems: 'center' },
  downloadButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
