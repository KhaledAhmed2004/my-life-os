import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Vital } from '@/constants/vital-theme';

const C = Vital.colors;
const F = Vital.fonts;

interface MessWhatsAppShareModalProps {
  visible: boolean;
  reportText: string;
  onClose: () => void;
}

export function MessWhatsAppShareModal({
  visible,
  reportText,
  onClose,
}: MessWhatsAppShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(reportText);
      setCopied(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => setCopied(false), 2500);
    } catch {
      Alert.alert('Copied', 'Report text copied to clipboard!');
    }
  };

  const handleShare = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (Platform.OS === 'web') {
        await handleCopy();
        return;
      }
      await Share.share({
        message: reportText,
        title: 'মেস হিসাব বিবরণী',
      });
    } catch (e) {
      console.warn('Failed to share mess report:', e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="share" size={18} color="#20C997" />
              </View>
              <View>
                <Text style={styles.title}>মেস গ্রুপে হিসাব শেয়ার</Text>
                <Text style={styles.subtitle}>
                  WhatsApp / Messenger এ ১-ট্যাপে পাঠান
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* Preview Box */}
            <View style={styles.previewBox}>
              <Text style={styles.previewText}>{reportText}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCopy}
                style={[styles.actionBtn, styles.copyBtn]}>
                <MaterialIcons
                  name={copied ? 'check' : 'content-copy'}
                  size={16}
                  color="#20C997"
                />
                <Text style={styles.copyBtnText}>
                  {copied ? 'Copied to Clipboard!' : 'রিপোর্ট কপি করুন'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShare}
                style={[styles.actionBtn, styles.shareBtn]}>
                <MaterialIcons name="send" size={16} color="#101416" />
                <Text style={styles.shareBtnText}>Share to Apps</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  sheetContainer: {
    backgroundColor: '#101416',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    fontSize: 15,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: 16,
    gap: 12,
  },
  previewBox: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 14,
  },
  previewText: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.onSurface,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  copyBtn: {
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
  },
  copyBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#20C997',
  },
  shareBtn: {
    backgroundColor: '#20C997',
  },
  shareBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#101416',
  },
});
