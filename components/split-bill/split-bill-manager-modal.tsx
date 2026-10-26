import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SplitBillCalculatorCard } from '@/components/split-bill/split-bill-calculator-card';
import { SplitBillShareModal } from '@/components/split-bill/split-bill-share-modal';
import { SplitMemberShareCard } from '@/components/split-bill/split-member-share-card';
import { useSplitBillStore } from '@/stores/split-bill-store';
import { Vital } from '@/constants/vital-theme';
import { SplitMember, SplitSession } from '@/types/split-bill';

const C = Vital.colors;
const F = Vital.fonts;

interface SplitBillManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SplitBillManagerModal({
  visible,
  onClose,
}: SplitBillManagerModalProps) {
  const sessions = useSplitBillStore((s) => s.sessions);
  const getStats = useSplitBillStore((s) => s.getStats);
  const deleteSession = useSplitBillStore((s) => s.deleteSession);
  const markMemberSettled = useSplitBillStore((s) => s.markMemberSettled);
  const syncMembersToUdhaar = useSplitBillStore((s) => s.syncMembersToUdhaar);

  const stats = useMemo(() => getStats(), [getStats, sessions]);

  const [activeTab, setActiveTab] = useState<'CALCULATOR' | 'HISTORY'>('CALCULATOR');
  const [selectedSessionForShare, setSelectedSessionForShare] = useState<SplitSession | null>(null);
  const [selectedMemberForShare, setSelectedMemberForShare] = useState<SplitMember | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const handleOpenShare = (session: SplitSession, member: SplitMember) => {
    setSelectedSessionForShare(session);
    setSelectedMemberForShare(member);
    setShareModalVisible(true);
  };

  const handleDeleteSession = (id: string, title: string) => {
    Alert.alert('Delete Bill History', `Remove "${title}" from your history?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void deleteSession(id),
      },
    ]);
  };

  const handleSyncSessionToUdhaar = async (sessionId: string) => {
    const count = await syncMembersToUdhaar(sessionId);
    Alert.alert(
      'Synced to Udhaar! 🤝',
      `${count} unpaid friends recorded as receivables in your Debt Tracker.`
    );
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
                <MaterialIcons name="call-split" size={20} color="#20C997" />
              </View>
              <View>
                <Text style={styles.title}>Group Bill Splitter</Text>
                <Text style={styles.subtitle}>
                  Restaurant VAT, Service & Udhaar Sync
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

          {/* Stats Bar */}
          <View style={styles.statsStrip}>
            <View style={styles.statTile}>
              <Text style={styles.statLabel}>TOTAL GROUP BILLS</Text>
              <Text style={styles.statVal}>৳{stats.totalBillsVolume.toLocaleString()}</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statLabel}>UNSETTLED RECEIVABLE</Text>
              <Text style={[styles.statVal, { color: '#FF922B' }]}>
                ৳{stats.totalUnsettledReceivable.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statLabel}>UNPAID FRIENDS</Text>
              <Text style={[styles.statVal, { color: '#FF6B6B' }]}>
                {stats.unsettledFriendsCount}
              </Text>
            </View>
          </View>

          {/* Segmented Switcher */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setActiveTab('CALCULATOR');
              }}
              style={[
                styles.segmentBtn,
                activeTab === 'CALCULATOR' && styles.segmentBtnActive,
              ]}>
              <MaterialIcons
                name="calculate"
                size={16}
                color={activeTab === 'CALCULATOR' ? '#101416' : C.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'CALCULATOR' && styles.segmentTextActive,
                ]}>
                New Bill Split
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setActiveTab('HISTORY');
              }}
              style={[
                styles.segmentBtn,
                activeTab === 'HISTORY' && styles.segmentBtnActive,
              ]}>
              <MaterialIcons
                name="history"
                size={16}
                color={activeTab === 'HISTORY' ? '#101416' : C.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'HISTORY' && styles.segmentTextActive,
                ]}>
                Past Splits ({sessions.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {activeTab === 'CALCULATOR' ? (
              <SplitBillCalculatorCard
                onSessionSaved={() => setActiveTab('HISTORY')}
                onOpenShareModal={handleOpenShare}
              />
            ) : (
              <View style={styles.historySection}>
                {sessions.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <MaterialIcons name="receipt-long" size={36} color={C.onSurfaceVariant} />
                    <Text style={styles.emptyTitle}>No past bill splits</Text>
                    <Text style={styles.emptySub}>
                      Calculate a new bill split above to save and sync with friends.
                    </Text>
                  </View>
                ) : (
                  sessions.map((sess) => {
                    const isExpanded = expandedSessionId === sess.id;
                    const dateStr = new Date(sess.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    });

                    const unpaidCount = sess.members.filter(
                      (m) => !m.isPayer && !m.isSettled
                    ).length;

                    return (
                      <View key={sess.id} style={styles.sessionCard}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            void Haptics.selectionAsync().catch(() => {});
                            setExpandedSessionId(isExpanded ? null : sess.id);
                          }}
                          style={styles.sessionHeader}>
                          <View style={styles.sessionLeft}>
                            <Text style={styles.sessionTitle}>{sess.title}</Text>
                            <Text style={styles.sessionSub}>
                              {sess.venue ? `${sess.venue} • ` : ''}
                              {dateStr} • {sess.members.length} people
                            </Text>
                          </View>

                          <View style={styles.sessionRight}>
                            <Text style={styles.sessionAmount}>
                              ৳{sess.totalBill.toLocaleString()}
                            </Text>
                            <View
                              style={[
                                styles.statusBadge,
                                unpaidCount === 0
                                  ? styles.statusBadgeDone
                                  : styles.statusBadgePending,
                              ]}>
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  unpaidCount === 0
                                    ? styles.statusBadgeTextDone
                                    : styles.statusBadgeTextPending,
                                ]}>
                                {unpaidCount === 0 ? 'ALL SETTLED' : `${unpaidCount} UNPAID`}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <View style={styles.expandedContent}>
                            <View style={styles.membersList}>
                              {sess.members.map((m) => (
                                <SplitMemberShareCard
                                  key={m.id}
                                  member={m}
                                  onToggleSettled={() =>
                                    void markMemberSettled(sess.id, m.id, !m.isSettled)
                                  }
                                  onShare={() => handleOpenShare(sess, m)}
                                  onSyncUdhaar={() => void handleSyncSessionToUdhaar(sess.id)}
                                />
                              ))}
                            </View>

                            <View style={styles.sessionActionsRow}>
                              <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => void handleSyncSessionToUdhaar(sess.id)}
                                style={styles.syncAllBtn}>
                                <MaterialIcons name="swap-horiz" size={14} color="#51CF66" />
                                <Text style={styles.syncAllBtnText}>Sync All to Udhaar</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => handleDeleteSession(sess.id, sess.title)}
                                style={styles.deleteSessionBtn}>
                                <MaterialIcons name="delete-outline" size={14} color="#FF6B6B" />
                                <Text style={styles.deleteSessionBtnText}>Delete</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Share to WhatsApp Modal */}
      <SplitBillShareModal
        visible={shareModalVisible}
        session={selectedSessionForShare}
        member={selectedMemberForShare}
        onClose={() => setShareModalVisible(false)}
      />
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
    height: '92%',
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
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
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
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#181F23',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontFamily: F.bold,
    fontSize: 8,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  statVal: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.onSurface,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#181F23',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#20C997',
  },
  segmentText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  segmentTextActive: {
    fontFamily: F.bold,
    color: '#101416',
  },
  scrollBody: {
    padding: 16,
  },
  historySection: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  sessionLeft: {
    flex: 1,
    gap: 2,
  },
  sessionTitle: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  sessionSub: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  sessionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sessionAmount: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#20C997',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeDone: {
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(255, 146, 43, 0.15)',
  },
  statusBadgeText: {
    fontFamily: F.bold,
    fontSize: 8,
  },
  statusBadgeTextDone: {
    color: '#20C997',
  },
  statusBadgeTextPending: {
    color: '#FF922B',
  },
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 12,
  },
  membersList: {
    gap: 8,
  },
  sessionActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  syncAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(81, 207, 102, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncAllBtnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#51CF66',
  },
  deleteSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  deleteSessionBtnText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: '#FF6B6B',
  },
  emptyCard: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.onSurface,
    marginTop: 4,
  },
  emptySub: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
});
