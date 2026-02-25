// app/contact.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Linking,
  Alert,
  Share,
  Modal,
  TextInput,
  KeyboardAvoidingView,
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
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/theme/ThemeContext';
import { PORTFOLIO_DATA } from '../src/data/portfolio';
import { EmailComposeModal } from '../src/components/EmailComposeModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WIDE = SCREEN_WIDTH >= 768;

// ─── Contact email & default content ──────────────────────────────────────────
const CONTACT_EMAIL   = 'krishnabharathisakthivel@gmail.com';
const DEFAULT_SUBJECT = 'Reaching out from your Portfolio';
const DEFAULT_BODY    =
`Hi Krishnabharathi,

I came across your portfolio and would love to connect.

[Tell us about the opportunity / project / collaboration you have in mind]

Looking forward to hearing from you!

Best regards,
[Your Name]`;

// ─── WhatsApp Modal ────────────────────────────────────────────────────────────
const WhatsAppModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  phone: string;
}> = ({ visible, onClose, phone }) => {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(
      message || 'Hi Krishnabharathi, I came across your portfolio and would like to connect.'
    );
    const url = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) {
        await Linking.openURL(url);
        onClose();
        setMessage('');
      } else {
        Alert.alert('WhatsApp Not Found', 'Please install WhatsApp to continue.');
      }
    } catch {
      Alert.alert('Error', 'Unable to open WhatsApp.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={mStyles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={mStyles.sheet}>
          <View style={mStyles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[mStyles.iconWrap, { backgroundColor: '#25D36615' }]}>
                <Text style={{ fontSize: 20 }}>💬</Text>
              </View>
              <View>
                <Text style={mStyles.headerTitle}>WhatsApp Message</Text>
                <Text style={mStyles.headerSub}>Opens in WhatsApp app</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={mStyles.closeBtn}>
              <Text style={mStyles.closeTxt}>✕</Text>
            </Pressable>
          </View>

          <View style={mStyles.toRow}>
            <Text style={mStyles.toLabel}>To</Text>
            <View style={[mStyles.toPill, { backgroundColor: '#25D36610', borderColor: '#25D36630' }]}>
              <View style={[mStyles.dot, { backgroundColor: '#25D366' }]} />
              <Text style={[mStyles.toValue, { color: '#25D366' }]}>{phone}</Text>
            </View>
          </View>

          <View style={mStyles.bodyWrap}>
            <TextInput
              style={mStyles.bodyInput}
              placeholder="Type your message here..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <Text style={mStyles.charCount}>{message.length} chars</Text>
          </View>

          <View style={mStyles.footer}>
            <Pressable onPress={onClose} style={mStyles.cancelBtn}>
              <Text style={mStyles.cancelTxt}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSend} style={[mStyles.sendBtn, { backgroundColor: '#25D366' }]}>
              <Text style={mStyles.sendTxt}>Open WhatsApp ↗</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Call Modal ────────────────────────────────────────────────────────────────
const CallModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  phone: string;
}> = ({ visible, onClose, phone }) => {
  const handleCall = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await Linking.openURL(`tel:${phone}`);
      onClose();
    } catch {
      Alert.alert('Error', 'Unable to initiate call.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={mStyles.overlay} onPress={onClose}>
        <View style={mStyles.callCard}>
          <LinearGradient colors={['#05966912', 'transparent']} style={StyleSheet.absoluteFill} />
          <View style={mStyles.callIconWrap}>
            <Text style={{ fontSize: 36 }}>📞</Text>
          </View>
          <Text style={mStyles.callTitle}>Direct Call</Text>
          <Text style={mStyles.callPhone}>{phone}</Text>
          <Text style={mStyles.callSub}>Opens your phone dialer app</Text>
          <View style={mStyles.callActions}>
            <Pressable onPress={onClose} style={mStyles.callCancelBtn}>
              <Text style={mStyles.callCancelTxt}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleCall} style={mStyles.callConfirmBtn}>
              <LinearGradient
                colors={['#059669', '#047857']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={mStyles.callConfirmGrad}
              >
                <Text style={mStyles.callConfirmTxt}>Call Now</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

// ─── Left Panel — Email Compose Card (uses EmailComposeModal) ─────────────────
const LeftPanel: React.FC<{ colors: any; isDark: boolean }> = ({ colors, isDark }) => {
  const [emailModal, setEmailModal] = useState(false);

  const panelOpacity = useSharedValue(0);
  const panelX       = useSharedValue(-24);
  useEffect(() => {
    panelOpacity.value = withTiming(1, { duration: 600 });
    panelX.value       = withSpring(0, { damping: 16 });
  }, []);
  const panelStyle = useAnimatedStyle(() => ({
    opacity:   panelOpacity.value,
    transform: [{ translateX: panelX.value }],
  }));

  return (
    <>
      <Animated.View
        style={[lStyles.card, panelStyle, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {/* Subtle gradient overlay */}
        <LinearGradient
          colors={isDark
            ? ['#7F5AF015', '#2563EB08', 'transparent']
            : ['#7F5AF008', '#2563EB05', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Label */}
        <View style={lStyles.labelRow}>
          <View style={lStyles.labelDot} />
          <Text style={[lStyles.labelTxt, { color: colors.textSecondary }]}>EMAIL COMPOSE</Text>
        </View>

        {/* Heading */}
        <Text style={[lStyles.heading, { color: colors.text }]}>Send a Message</Text>
        <Text style={[lStyles.sub, { color: colors.textSecondary }]}>
          Opens a professional email compose window pre-filled with your details.
        </Text>

        {/* To (read-only display) */}
        <View style={[lStyles.toRow, { borderColor: colors.border }]}>
          <Text style={[lStyles.toTag, { color: colors.textSecondary }]}>To</Text>
          <View style={[lStyles.toPill, { backgroundColor: '#2563EB10', borderColor: '#2563EB30' }]}>
            <Text style={lStyles.toEmail}>✉️  {CONTACT_EMAIL}</Text>
          </View>
        </View>

        {/* Preview fields — read-only hint */}
        <View style={[lStyles.previewBlock, { borderColor: colors.border }]}>
          <Text style={[lStyles.previewLabel, { color: colors.textSecondary }]}>SUBJECT</Text>
          <Text style={[lStyles.previewValue, { color: colors.text }]} numberOfLines={1}>
            {DEFAULT_SUBJECT}
          </Text>
        </View>

        <View style={[lStyles.previewBlock, { borderColor: colors.border }]}>
          <Text style={[lStyles.previewLabel, { color: colors.textSecondary }]}>MESSAGE PREVIEW</Text>
          <Text style={[lStyles.previewValue, { color: colors.textSecondary }]} numberOfLines={3}>
            {DEFAULT_BODY.trim()}
          </Text>
        </View>

        {/* Info chip */}
        <View style={[lStyles.infoChip, { backgroundColor: `#7F5AF012`, borderColor: `#7F5AF030` }]}>
          <Text style={{ fontSize: 13 }}>✏️</Text>
          <Text style={[lStyles.infoChipTxt, { color: colors.textSecondary }]}>
            You can edit subject & message before sending
          </Text>
        </View>

        {/* Open compose button */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEmailModal(true);
          }}
          style={lStyles.composeBtn}
        >
          <LinearGradient
            colors={['#7F5AF0', '#2563EB']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={lStyles.composeGrad}
          >
            <Text style={lStyles.composeTxt}>✉️  Compose Email  ↗</Text>
          </LinearGradient>
        </Pressable>

        <Text style={[lStyles.tip, { color: colors.textMuted ?? '#9CA3AF' }]}>
          Opens your default mail app with the message pre-filled.
        </Text>
      </Animated.View>

      {/* Shared EmailComposeModal */}
      <EmailComposeModal
        visible={emailModal}
        onClose={() => setEmailModal(false)}
        toEmail={CONTACT_EMAIL}
        defaultSubject={DEFAULT_SUBJECT}
        defaultBody={DEFAULT_BODY}
        accentColor="#7F5AF0"
        modalTitle="Send a Message"
      />
    </>
  );
};

// ─── Right Panel — Contact Channels ───────────────────────────────────────────
const RightPanel: React.FC<{
  colors: any;
  onWhatsApp: () => void;
  onCall: () => void;
}> = ({ colors, onWhatsApp, onCall }) => {
  const channels = [
    {
      id: 'phone',
      label: 'Phone',
      value: PORTFOLIO_DATA.personal.phone,
      icon: '📞',
      accent: '#059669',
      bg: '#05966912',
      badge: 'Call Now',
      onPress: onCall,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      value: PORTFOLIO_DATA.personal.phone,
      icon: '💬',
      accent: '#25D366',
      bg: '#25D36612',
      badge: 'Chat',
      onPress: onWhatsApp,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      value: 'Connect on LinkedIn',
      icon: '💼',
      accent: '#0A66C2',
      bg: '#0A66C212',
      badge: 'Open',
      onPress: () =>
        Linking.openURL(PORTFOLIO_DATA.personal.linkedin).catch(() =>
          Alert.alert('Error', 'Unable to open link')
        ),
    },
    {
      id: 'github',
      label: 'GitHub',
      value: 'View Portfolio',
      icon: '🐙',
      accent: '#6E40C9',
      bg: '#6E40C912',
      badge: 'Open',
      onPress: () =>
        Linking.openURL(PORTFOLIO_DATA.personal.github).catch(() =>
          Alert.alert('Error', 'Unable to open link')
        ),
    },
    {
      id: 'location',
      label: 'Location',
      value: PORTFOLIO_DATA.personal.location,
      icon: '📍',
      accent: '#DC2626',
      bg: '#DC262612',
      badge: 'Share',
      onPress: () =>
        Share.share({ message: `Location: ${PORTFOLIO_DATA.personal.location}` }),
    },
  ];

  const rightOpacity = useSharedValue(0);
  const rightX       = useSharedValue(24);
  useEffect(() => {
    rightOpacity.value = withDelay(150, withTiming(1, { duration: 600 }));
    rightX.value       = withDelay(150, withSpring(0, { damping: 16 }));
  }, []);
  const rightStyle = useAnimatedStyle(() => ({
    opacity:   rightOpacity.value,
    transform: [{ translateX: rightX.value }],
  }));

  return (
    <Animated.View style={[rStyles.container, rightStyle]}>
      {/* Header */}
      <View style={rStyles.header}>
        <View style={rStyles.statusRow}>
          <View style={rStyles.greenDot} />
          <Text style={[rStyles.statusTxt, { color: colors.textSecondary }]}>
            Available for opportunities
          </Text>
        </View>
        <Text style={[rStyles.heading, { color: colors.text }]}>Other Channels</Text>
        <Text style={[rStyles.sub, { color: colors.textSecondary }]}>
          Reach out via your preferred platform
        </Text>
      </View>

      {/* Cards */}
      <View style={rStyles.list}>
        {channels.map((item, i) => {
          const cardOpacity = useSharedValue(0);
          const cardY       = useSharedValue(16);
          useEffect(() => {
            cardOpacity.value = withDelay(i * 70 + 250, withTiming(1, { duration: 400 }));
            cardY.value       = withDelay(i * 70 + 250, withSpring(0, { damping: 18 }));
          }, []);
          const cardAnim = useAnimatedStyle(() => ({
            opacity:   cardOpacity.value,
            transform: [{ translateY: cardY.value }],
          }));

          return (
            <Animated.View key={item.id} style={cardAnim}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  item.onPress();
                }}
                style={[rStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[rStyles.accentBar, { backgroundColor: item.accent }]} />
                <View style={[rStyles.iconWrap, { backgroundColor: item.bg }]}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={rStyles.info}>
                  <Text style={[rStyles.cardLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[rStyles.cardValue, { color: colors.text }]} numberOfLines={1}>{item.value}</Text>
                </View>
                <View style={[rStyles.badge, { backgroundColor: item.bg, borderColor: `${item.accent}30` }]}>
                  <Text style={[rStyles.badgeTxt, { color: item.accent }]}>{item.badge} →</Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Footer */}
      <View style={[rStyles.footer, { borderColor: colors.border }]}>
        <Text style={[rStyles.footerTxt, { color: colors.textSecondary }]}>
          💡 Typical response time: within 24 hours
        </Text>
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ContactScreen() {
  const { colors, isDark } = useTheme();
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [callModal,     setCallModal]     = useState(false);

  const hdrOpacity = useSharedValue(0);
  const hdrY       = useSharedValue(-16);
  useEffect(() => {
    hdrOpacity.value = withTiming(1, { duration: 500 });
    hdrY.value       = withSpring(0, { damping: 16 });
  }, []);
  const hdrStyle = useAnimatedStyle(() => ({
    opacity:   hdrOpacity.value,
    transform: [{ translateY: hdrY.value }],
  }));

  return (
    <View style={[gStyles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark
          ? ['#0A0A0F', '#0D1020', '#0A0A0F']
          : ['#F8F9FF', '#EEF2FF', '#F8F9FF']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={gStyles.scroll} showsVerticalScrollIndicator={false}>

        {/* Section header */}
        <Animated.View style={[gStyles.sectionHdr, hdrStyle]}>
          <Text style={[gStyles.title, { color: colors.text }]}>Contact Me</Text>
          <Text style={[gStyles.titleSub, { color: colors.textSecondary }]}>
            Open to full-time roles, freelance projects & collaborations
          </Text>
        </Animated.View>

        {/* Split layout */}
        {IS_WIDE ? (
          <View style={gStyles.splitRow}>
            <View style={gStyles.leftCol}>
              <LeftPanel colors={colors} isDark={isDark} />
            </View>
            <View style={gStyles.rightCol}>
              <RightPanel
                colors={colors}
                onWhatsApp={() => setWhatsappModal(true)}
                onCall={() => setCallModal(true)}
              />
            </View>
          </View>
        ) : (
          <View style={gStyles.stackCol}>
            <LeftPanel colors={colors} isDark={isDark} />
            <RightPanel
              colors={colors}
              onWhatsApp={() => setWhatsappModal(true)}
              onCall={() => setCallModal(true)}
            />
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      <WhatsAppModal
        visible={whatsappModal}
        onClose={() => setWhatsappModal(false)}
        phone={PORTFOLIO_DATA.personal.phone}
      />
      <CallModal
        visible={callModal}
        onClose={() => setCallModal(false)}
        phone={PORTFOLIO_DATA.personal.phone}
      />
    </View>
  );
}

// ─── Stylesheets ───────────────────────────────────────────────────────────────
const gStyles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 },
  sectionHdr: { alignItems: 'center', marginBottom: 32, gap: 10 },
  title:    { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  titleSub: { fontSize: 14, textAlign: 'center', maxWidth: 320, lineHeight: 20 },
  splitRow: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  leftCol:  { flex: 1.15 },
  rightCol: { flex: 0.85 },
  stackCol: { gap: 20 },
});

// Left panel card (preview card — not the form itself)
const lStyles = StyleSheet.create({
  card: {
    borderWidth: 1, borderRadius: 20,
    padding: 24, overflow: 'hidden',
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  labelDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7F5AF0' },
  labelTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  heading:  { fontSize: 22, fontWeight: '800', letterSpacing: -0.3, marginBottom: 4 },
  sub:      { fontSize: 13, lineHeight: 18, marginBottom: 20 },

  toRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingBottom: 16, marginBottom: 0, borderBottomWidth: 1,
  },
  toTag: { fontSize: 12, fontWeight: '600', width: 28 },
  toPill: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1,
  },
  toEmail: { fontSize: 13, fontWeight: '600', color: '#2563EB' },

  previewBlock: {
    paddingVertical: 13, borderBottomWidth: 1, gap: 5,
  },
  previewLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  previewValue: { fontSize: 13, fontWeight: '500', lineHeight: 18 },

  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 16, marginBottom: 20,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1,
  },
  infoChipTxt: { fontSize: 12, flex: 1, lineHeight: 17 },

  composeBtn:  { borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  composeGrad: { paddingVertical: 15, alignItems: 'center' },
  composeTxt:  { color: '#fff', fontWeight: '700', fontSize: 15 },

  tip: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
});

const rStyles = StyleSheet.create({
  container: { gap: 16 },
  header:    { gap: 6, marginBottom: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greenDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 4,
  },
  statusTxt: { fontSize: 12, fontWeight: '500' },
  heading:   { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  sub:       { fontSize: 13, lineHeight: 18 },

  list: { gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 14,
    paddingVertical: 14, paddingRight: 14, gap: 12, overflow: 'hidden',
  },
  accentBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  iconWrap:  { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info:      { flex: 1, gap: 2 },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  cardValue: { fontSize: 13, fontWeight: '600' },
  badge:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  badgeTxt:  { fontSize: 11, fontWeight: '700' },

  footer:    { borderTopWidth: 1, paddingTop: 14, alignItems: 'center' },
  footerTxt: { fontSize: 12 },
});

const mStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  sheet: {
    width: '100%', maxWidth: 480,
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  iconWrap:    { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSub:   { fontSize: 12, color: '#6B7280', marginTop: 1 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontSize: 14, color: '#6B7280', fontWeight: '600' },

  toRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  toLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', width: 24 },
  toPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  dot:     { width: 7, height: 7, borderRadius: 4 },
  toValue: { fontSize: 13, fontWeight: '600' },

  bodyWrap:  { padding: 20, minHeight: 160, position: 'relative' },
  bodyInput: { fontSize: 14, color: '#111827', minHeight: 120 },
  charCount: { position: 'absolute', bottom: 12, right: 20, fontSize: 11, color: '#9CA3AF' },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  cancelBtn: {
    paddingHorizontal: 20, paddingVertical: 11, borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  cancelTxt: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  sendBtn:   { paddingHorizontal: 24, paddingVertical: 11, borderRadius: 10 },
  sendTxt:   { fontSize: 14, fontWeight: '700', color: '#fff' },

  callCard: {
    width: '100%', maxWidth: 380, backgroundColor: '#fff',
    borderRadius: 24, padding: 28, alignItems: 'center', overflow: 'hidden',
  },
  callIconWrap: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#05966912',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  callTitle:      { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
  callPhone:      { fontSize: 17, fontWeight: '700', color: '#059669', marginBottom: 8 },
  callSub:        { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 28 },
  callActions:    { flexDirection: 'row', gap: 12, width: '100%' },
  callCancelBtn:  { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#F3F4F6' },
  callCancelTxt:  { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  callConfirmBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  callConfirmGrad:{ paddingVertical: 14, alignItems: 'center' },
  callConfirmTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
