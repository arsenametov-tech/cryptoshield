import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { StorageService, ScanHistoryItem } from '@/services/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCard, AnimatedIconButton } from '@/components/AnimatedPressable';
import { HapticsService } from '@/services/haptics';

export default function History() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  const loadHistory = async () => {
    try {
      const data = await StorageService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const handleClearHistory = () => {
    HapticsService.warning();
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scan history? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => HapticsService.light(),
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            HapticsService.success();
            await StorageService.clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'critical':
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return 'shield-checkmark';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'safe':
        return 'SAFE';
      case 'warning':
        return 'MODERATE';
      case 'critical':
        return 'CRITICAL';
      default:
        return 'UNKNOWN';
    }
  };

  const formatDate = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  const renderItem = ({ item }: { item: ScanHistoryItem }) => (
    <AnimatedCard
      style={styles.historyCard}
      onPress={() => router.push({
        pathname: '/scan-results',
        params: { address: item.address, fromHistory: 'true' },
      })}
      scaleOnPress={0.98}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.statusIcon, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons
            name={getStatusIcon(item.status)}
            size={28}
            color={getStatusColor(item.status)}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <View style={styles.cardMeta}>
            <Ionicons
              name={item.type === 'contract' ? 'code-slash' : 'globe-outline'}
              size={12}
              color={colors.textMuted}
            />
            <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.cardScore, { color: getStatusColor(item.status) }]}>
          {item.score}
        </Text>
        <Text style={styles.cardScoreSuffix}>/100</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.cardStatus, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
    </AnimatedCard>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View>
          <Text style={styles.headerTitle}>Scan History</Text>
          <Text style={styles.headerSubtitle}>
            {history.length} {history.length === 1 ? 'scan' : 'scans'} recorded
          </Text>
        </View>
        {history.length > 0 && (
          <AnimatedIconButton style={styles.clearButton} onPress={handleClearHistory} hapticType="warning">
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </AnimatedIconButton>
        )}
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="time-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyText}>No scan history yet</Text>
            <Text style={styles.emptySubtext}>
              Start scanning contracts and websites{'\n'}to build your security log
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  clearButton: {
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 80,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  cardScore: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize.xxl,
  },
  cardScoreSuffix: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  cardStatus: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  emptySubtext: {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
