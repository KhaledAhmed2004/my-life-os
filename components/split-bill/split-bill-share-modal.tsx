import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSplitBillStore } from '@/stores/split-bill-store';
import { Vital } from '@/constants/vital-theme';
import { SplitMember, SplitSession } from '@/types/split-bill';

const C = Vital.colors;
const F = Vital.fonts;

interface SplitBillShareModalProps {
  visible: boolean;
  session: SplitSession | null;
  member: SplitMember | null;
  onClose: () => void;
}

export function SplitBillShareModal({
  visible,
  session,
  member,
  onClose,
}: SplitBillShareModalProps) {
  const myPaymentNumber = useSplitBillStore((s) => s.myPaymentNumber);
  const setMyPaymentNumber = useSplitBillStore((s) => s.setMyPaymentNumber);
  const generateWhatsAppText = useSplitBillStore((s) => s.generateWhatsAppText);

  const [paymentNumInput, setPaymentNumInput] = useState(myPaymentNumber || '');
  const [isCopied, setIsCopied] = useState(false);

  if (!session || !member) return null;

  const messageText = generateWhatsAppText(session.id, member.id);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(messageText);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleShare = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      await Share.share({
        message: messageText,
        title: `Bill Share: ${session.title}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleSavePaymentNumber = async () => {
    if (paymentNumInput.trim()) {
      await setMyPaymentNumber(paymentNumInput.trim());
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="share" size={20} color="#20C997" />
              </View>
              <View>
                <Text style={styles.title}>Send Payment Request</Text>
                <Text style={styles.subtitle}>
                  Share to {member.name} via WhatsApp or SMS
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* bKash Number Setting */}
          <View style={styles.paymentNumBox}>
            <View style={styles.paymentNumHeader}>
              <MaterialIcons name="account-balance-wallet" size={16} color="#FF922B" />
              <Text style={styles.paymentNumLabel}>YOUR BKASH / NAGAD NUMBER</Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.paymentInput}
                placeholder="e.g. 01711-XXXXXX"
                placeholderTextColor={C.onSurfaceVariant}
                value={paymentNumInput}
                onChangeText={setPaymentNumInput}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSavePaymentNumber}
                style={styles.saveNumBtn}>
                <Text style={styles.saveNumText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Preview Box */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewHeader}>MESSAGE PREVIEW</Text>
            <View style={styles.bubbleBox}>
              <Text style={styles.bubbleText}>{messageText}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCopy}
              style={[styles.actionBtn, styles.copyBtn]}>
              <MaterialIcons
                name={isCopied ? 'check' : 'content-copy'}
                size={18}
                color={isCopied ? '#20C997' : C.onSurface}
              />
              <Text style={[styles.actionBtnText, { color: isCopied ? '#20C997' : C.onSurface }]}>
                {isCopied ? 'Copied to Clipboard!' : 'Copy Text'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShare}
              style={[styles.actionBtn, styles.shareBtn]}>
              <MaterialIcons name="send" size={18} color="#101416" />
              <Text style={[styles.actionBtnText, { color: '#101416' }]}>
                Share to Apps
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#101416',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 14,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    padding: 6,
  },
  paymentNumBox: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  paymentNumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentNumLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#FF922B',
    letterSpacing: 0.6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentInput: {
    flex: 1,
    backgroundColor: '#101416',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: F.medium,
    fontSize: 13,
    color: '#FFFFFF',
  },
  saveNumBtn: {
    backgroundColor: 'rgba(255, 146, 43, 0.15)',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 10,
  },
  saveNumText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FF922B',
  },
  previewContainer: {
    gap: 6,
  },
  previewHeader: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  bubbleBox: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 14,
    maxHeight: 180,
  },
  bubbleText: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.onSurface,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  copyBtn: {
    backgroundColor: '#181F23',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  shareBtn: {
    backgroundColor: '#20C997',
  },
  actionBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
  },
});
