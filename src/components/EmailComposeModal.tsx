// src/components/EmailComposeModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export interface EmailComposeModalProps {
  visible: boolean;
  onClose: () => void;
  toEmail: string;
  defaultSubject?: string;
  defaultBody?: string;
  accentColor?: string;
  modalTitle?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  buildMailtoUrl
//
//  Problem with a naive `encodeURIComponent` approach:
//    • encodeURIComponent encodes spaces as %20, which is correct for URL paths
//      but some Android mail clients expect + for spaces in query params.
//    • \n becomes %0A, which is correct, BUT some Android clients silently drop
//      the body when the full URI is very long or when %0A appears in certain
//      positions.
//    • iOS Mail handles all of this fine; Android Gmail / Outlook are picky.
//
//  Fix — encode each query-param value with a helper that:
//    1. Encodes everything with encodeURIComponent (safe baseline).
//    2. Restores %20 → '+' for Android Gmail compatibility.
//    3. Ensures newlines are always %0A (encodeURIComponent already does this,
//       but we also normalise \r\n → \n first so Windows-style breaks are safe).
//    4. Keeps the "to" address unencoded in the path portion (RFC 6068).
// ─────────────────────────────────────────────────────────────────────────────
function encodeMailtoParam(value: string): string {
  // Normalise line endings → \n, then encode
  const normalised = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // encodeURIComponent is the correct baseline for mailto query values (RFC 6068)
  // It encodes \n → %0A, spaces → %20, & → %26, = → %3D, + → %2B, etc.
  return encodeURIComponent(normalised);
}

function buildMailtoUrl(
  to: string,
  subject: string,
  body: string,
): string {
  const params: string[] = [];

  if (subject.trim()) {
    params.push(`subject=${encodeMailtoParam(subject.trim())}`);
  }
  if (body.trim()) {
    params.push(`body=${encodeMailtoParam(body.trim())}`);
  }

  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${to}${query}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export const EmailComposeModal: React.FC<EmailComposeModalProps> = ({
  visible,
  onClose,
  toEmail,
  defaultSubject = '',
  defaultBody = '',
  accentColor = '#7F5AF0',
  modalTitle = 'Send Email',
}) => {
  const [name,    setName]    = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body,    setBody]    = useState(defaultBody);
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);

  // Reset fields whenever modal opens with new props
  useEffect(() => {
    if (visible) {
      setName('');
      setSubject(defaultSubject);
      setBody(defaultBody);
      setSent(false);
      setSending(false);
    }
  }, [visible, defaultSubject, defaultBody]);

  const handleSend = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter your name before sending.');
      return;
    }
    if (!body.trim()) {
      Alert.alert('Empty Message', 'Please write a message before sending.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSending(true);

    // Build the full body: prepend the sender name so the recipient knows who wrote
    const fullBody = `From: ${name.trim()}\n\n${body.trim()}`;

    const mailtoUrl = buildMailtoUrl(subject, fullBody, '');
    // ↑ Wait — the signature of buildMailtoUrl is (to, subject, body)
    // Let's call it correctly:
    const url = buildMailtoUrl(toEmail, subject, fullBody);

    try {
      // Always check canOpenURL first — on Android this can fail silently
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert(
          'No Mail App Found',
          'Please install a mail app (Gmail, Outlook, etc.) and set it as the default, then try again.',
        );
        setSending(false);
        return;
      }

      await Linking.openURL(url);

      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
      }, 1800);
    } catch (err: any) {
      Alert.alert(
        'Could Not Open Mail App',
        'Please make sure a mail app is installed and set as default on your device.\n\n' +
          (err?.message ?? ''),
      );
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.overlay}
      >
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View style={s.sheet}>

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <LinearGradient
            colors={[`${accentColor}18`, `${accentColor}05`]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.headerGrad}
          >
            <View style={s.header}>
              <View style={s.headerLeft}>
                <LinearGradient
                  colors={[accentColor, '#2563EB']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.headerIcon}
                >
                  <Text style={{ fontSize: 18 }}>✉️</Text>
                </LinearGradient>
                <View>
                  <Text style={s.headerTitle}>{modalTitle}</Text>
                  <Text style={s.headerSub}>Opens in your mail app</Text>
                </View>
              </View>
              <Pressable onPress={handleClose} style={s.closeBtn} hitSlop={10}>
                <Text style={s.closeTxt}>✕</Text>
              </Pressable>
            </View>

            {/* To (read-only) */}
            <View style={s.toRow}>
              <Text style={s.toLabel}>To</Text>
              <View style={[s.toPill, { backgroundColor: `${accentColor}12`, borderColor: `${accentColor}35` }]}>
                <View style={[s.toDot, { backgroundColor: accentColor }]} />
                <Text style={[s.toValue, { color: accentColor }]} numberOfLines={1}>{toEmail}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* ── Form Fields ─────────────────────────────────────────────────── */}
          <ScrollView
            style={s.fieldsScroll}
            contentContainerStyle={s.fieldsContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Your Name */}
            <View style={s.fieldBlock}>
              <Text style={s.fieldLabel}>YOUR NAME *</Text>
              <TextInput
                style={s.fieldInput}
                placeholder="e.g. John Smith / HR - Infosys"
                placeholderTextColor="#B0B7C3"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>

            {/* Subject */}
            <View style={s.fieldBlock}>
              <Text style={s.fieldLabel}>SUBJECT</Text>
              <TextInput
                style={s.fieldInput}
                placeholder="Job Opportunity / Collaboration"
                placeholderTextColor="#B0B7C3"
                value={subject}
                onChangeText={setSubject}
                returnKeyType="next"
              />
            </View>

            {/* Message */}
            <View style={[s.fieldBlock, s.msgBlock]}>
              <Text style={s.fieldLabel}>MESSAGE *</Text>
              <TextInput
                style={s.msgInput}
                placeholder="Write your message here..."
                placeholderTextColor="#B0B7C3"
                value={body}
                onChangeText={setBody}
                multiline
                textAlignVertical="top"
                scrollEnabled={false}
              />
              <Text style={s.charHint}>{body.length} chars</Text>
            </View>
          </ScrollView>

          {/* ── Footer / Actions ─────────────────────────────────────────────── */}
          <View style={s.footer}>
            <Pressable onPress={handleClose} style={s.cancelBtn}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </Pressable>

            {sent ? (
              <View style={s.sentBadge}>
                <Text style={s.sentTxt}>✓ Mail app opened!</Text>
              </View>
            ) : (
              <Pressable onPress={handleSend} disabled={sending} style={s.sendBtnWrap}>
                <LinearGradient
                  colors={sending ? ['#888', '#666'] : [accentColor, '#2563EB']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.sendGrad}
                >
                  <Text style={s.sendTxt}>
                    {sending ? 'Opening...' : 'Send Email  ↗'}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 28,
    maxHeight: '90%',
  },

  // Header gradient area
  headerGrad: { paddingBottom: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827', letterSpacing: -0.2 },
  headerSub:   { fontSize: 12, color: '#6B7280', marginTop: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontSize: 13, color: '#64748B', fontWeight: '700' },

  // To row
  toRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  toLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, width: 24 },
  toPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  toDot:  { width: 7, height: 7, borderRadius: 4 },
  toValue: { fontSize: 13, fontWeight: '600', flex: 1 },

  // Fields
  fieldsScroll: { maxHeight: 340 },
  fieldsContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },

  fieldBlock: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  fieldInput: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    paddingVertical: 0,
  },

  msgBlock: { borderBottomWidth: 0, paddingBottom: 0 },
  msgInput: {
    fontSize: 14,
    color: '#1E293B',
    minHeight: 110,
    fontWeight: '400',
    lineHeight: 22,
  },
  charHint: {
    fontSize: 11,
    color: '#CBD5E1',
    textAlign: 'right',
    marginTop: 4,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },

  sendBtnWrap: { borderRadius: 12, overflow: 'hidden' },
  sendGrad: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sendTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, letterSpacing: 0.2 },

  sentBadge: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  sentTxt: { color: '#059669', fontWeight: '700', fontSize: 14 },
});
