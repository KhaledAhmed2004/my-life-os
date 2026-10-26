import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMorningThoughtsStore } from '@/stores/morning-thoughts-store';
import { MorningSession } from '@/types/morning-thoughts';
import { Vital } from '@/constants/vital-theme';

export default function MorningHistoryScreen() {
  const { sessions, deleteSession, playRecordedAudio } = useMorningThoughtsStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (session: MorningSession) => {
    Alert.alert(
      'Delete Session?',
      `Are you sure you want to delete the 10 thoughts for ${session.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void deleteSession(session.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📜 Morning Thoughts History</Text>
          <Text style={styles.subtitle}>
            Browse all previously saved 10 morning thought logs
          </Text>
        </View>

        {/* Empty State */}
        {sessions.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="wb-twilight" size={40} color="#F59E0B" />
            </View>
            <Text style={styles.emptyTitle}>No thoughts recorded yet</Text>
            <Text style={styles.emptySubtitle}>
              Wake up in the morning, record your voice thoughts, and save them to view here.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sessions.map((session) => {
              const isExpanded = expandedId === session.id;
              return (
                <View key={session.id} style={styles.sessionCard}>
                  {/* Session Header */}
                  <Pressable
                    style={styles.sessionHeaderRow}
                    onPress={() =>
                      setExpandedId(isExpanded ? null : session.id)
                    }>
                    <View style={styles.sessionDateBadge}>
                      <MaterialIcons name="calendar-today" size={14} color="#F59E0B" />
                      <Text style={styles.sessionDateText}>{session.date}</Text>
                      <Text style={styles.sessionTimeText}>• {session.time}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Pressable
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(session)}>
                        <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                      </Pressable>
                      <MaterialIcons
                        name={isExpanded ? 'expand-less' : 'expand-more'}
                        size={24}
                        color="#94A3B8"
                      />
                    </View>
                  </Pressable>

                  {/* Summary Snippet */}
                  {session.aiSummary ? (
                    <Text style={styles.sessionSummaryText} numberOfLines={isExpanded ? undefined : 2}>
                      💡 {session.aiSummary}
                    </Text>
                  ) : null}

                  {/* Expanded 10 Thoughts */}
                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />
                      <Text style={styles.thoughtsHeaderTitle}>
                        10 Thoughts:
                      </Text>

                      {session.thoughts.map((th, idx) => (
                        <View key={th.id || idx} style={styles.thoughtItemRow}>
                          <View style={styles.idxBadge}>
                            <Text style={styles.idxText}>{idx + 1}</Text>
                          </View>
                          <Text style={styles.thoughtItemText}>{th.text}</Text>
                        </View>
                      ))}

                      {session.transcript ? (
                        <View style={styles.transcriptBox}>
                          <Text style={styles.transcriptLabel}>Original Transcript:</Text>
                          <Text style={styles.transcriptBody}>{session.transcript}</Text>
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D131F',
  },
  container: {
    flex: 1,
    backgroundColor: '#0D131F',
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontFamily: Vital.fonts.bold,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: Vital.fonts.regular,
    marginTop: 4,
  },
  emptyBox: {
    backgroundColor: '#161F2E',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginVertical: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontFamily: Vital.fonts.bold,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: Vital.fonts.regular,
    textAlign: 'center',
    lineHeight: 19,
  },
  list: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#161F2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sessionDateText: {
    color: '#FDE68A',
    fontSize: 12.5,
    fontFamily: Vital.fonts.bold,
    marginLeft: 6,
  },
  sessionTimeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: Vital.fonts.medium,
    marginLeft: 4,
  },
  deleteBtn: {
    padding: 6,
    marginRight: 6,
  },
  sessionSummaryText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontFamily: Vital.fonts.medium,
    marginTop: 10,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 12,
  },
  expandedContent: {
    marginTop: 4,
  },
  thoughtsHeaderTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontFamily: Vital.fonts.bold,
    marginBottom: 10,
  },
  thoughtItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  idxBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  idxText: {
    color: '#F59E0B',
    fontSize: 11,
    fontFamily: Vital.fonts.bold,
  },
  thoughtItemText: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 13,
    fontFamily: Vital.fonts.regular,
    lineHeight: 18,
  },
  transcriptBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#64748B',
  },
  transcriptLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: Vital.fonts.bold,
    marginBottom: 4,
  },
  transcriptBody: {
    color: '#CBD5E1',
    fontSize: 12,
    fontFamily: Vital.fonts.regular,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
