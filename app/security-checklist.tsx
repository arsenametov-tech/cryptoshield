import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  critical: boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: '1',
    category: 'Contract Security',
    title: 'Contract Verified',
    description: 'Contract source code is verified on blockchain explorer',
    critical: true,
  },
  {
    id: '2',
    category: 'Contract Security',
    title: 'Audit Completed',
    description: 'Smart contract has been audited by reputable firm',
    critical: true,
  },
  {
    id: '3',
    category: 'Contract Security',
    title: 'No Honeypot',
    description: 'Tokens can be sold freely without restrictions',
    critical: true,
  },
  {
    id: '4',
    category: 'Ownership & Control',
    title: 'Ownership Renounced',
    description: 'Contract owner has renounced ownership rights',
    critical: false,
  },
  {
    id: '5',
    category: 'Ownership & Control',
    title: 'No Mint Function',
    description: 'Owner cannot mint new tokens arbitrarily',
    critical: true,
  },
  {
    id: '6',
    category: 'Ownership & Control',
    title: 'No Proxy Contract',
    description: 'Contract logic cannot be changed via proxy',
    critical: false,
  },
  {
    id: '7',
    category: 'Liquidity Security',
    title: 'Liquidity Locked',
    description: 'LP tokens are locked for adequate timeframe',
    critical: true,
  },
  {
    id: '8',
    category: 'Liquidity Security',
    title: 'Sufficient Liquidity',
    description: 'Adequate liquidity for trading volume',
    critical: false,
  },
  {
    id: '9',
    category: 'Liquidity Security',
    title: 'No Backdoor Withdrawals',
    description: 'No hidden functions to remove liquidity',
    critical: true,
  },
  {
    id: '10',
    category: 'Team & Transparency',
    title: 'Team Doxxed',
    description: 'Team members have revealed their identities',
    critical: false,
  },
  {
    id: '11',
    category: 'Team & Transparency',
    title: 'Active Communication',
    description: 'Team regularly updates community',
    critical: false,
  },
  {
    id: '12',
    category: 'Team & Transparency',
    title: 'Whitepaper Available',
    description: 'Comprehensive whitepaper with clear roadmap',
    critical: false,
  },
  {
    id: '13',
    category: 'Token Distribution',
    title: 'Fair Launch',
    description: 'No presale or team allocation concerns',
    critical: false,
  },
  {
    id: '14',
    category: 'Token Distribution',
    title: 'Distributed Holdings',
    description: 'No single wallet holds excessive percentage',
    critical: true,
  },
  {
    id: '15',
    category: 'Token Distribution',
    title: 'Vesting Schedule',
    description: 'Team tokens subject to vesting period',
    critical: false,
  },
];

export default function SecurityChecklist() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const criticalItems = CHECKLIST_ITEMS.filter(item => item.critical);
  const checkedCritical = criticalItems.filter(item => checkedItems.has(item.id)).length;
  const totalChecked = checkedItems.size;
  const totalItems = CHECKLIST_ITEMS.length;
  const progress = Math.round((totalChecked / totalItems) * 100);

  const getScoreColor = () => {
    if (checkedCritical < criticalItems.length) return colors.danger;
    if (progress < 60) return colors.warning;
    return colors.success;
  };

  const getScoreLabel = () => {
    if (checkedCritical < criticalItems.length) return 'CRITICAL ITEMS MISSING';
    if (progress < 60) return 'NEEDS IMPROVEMENT';
    if (progress < 80) return 'GOOD SECURITY';
    return 'EXCELLENT SECURITY';
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Checklist',
      'Are you sure you want to clear all checked items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => setCheckedItems(new Set()),
        },
      ]
    );
  };

  const groupedItems = CHECKLIST_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Checklist</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <LinearGradient
            colors={[getScoreColor() + '40', getScoreColor() + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressGradient}
          >
            <View style={styles.progressContent}>
              <Text style={[styles.progressScore, { color: getScoreColor() }]}>
                {progress}%
              </Text>
              <Text style={styles.progressLabel}>{getScoreLabel()}</Text>
              <View style={styles.progressStats}>
                <Text style={styles.progressStat}>
                  {totalChecked}/{totalItems} items checked
                </Text>
                <Text style={[styles.progressStat, { color: getScoreColor() }]}>
                  {checkedCritical}/{criticalItems.length} critical ✓
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Info Alert */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Use this checklist to manually verify project security. Critical items marked with ⚠️
            must be checked for safe investment.
          </Text>
        </View>

        {/* Checklist Groups */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>

            {items.map((item) => {
              const isChecked = checkedItems.has(item.id);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.checklistItem, isChecked && styles.checklistItemChecked]}
                  onPress={() => toggleItem(item.id)}
                >
                  <View style={styles.checkboxContainer}>
                    <View
                      style={[
                        styles.checkbox,
                        isChecked && { backgroundColor: colors.primary },
                      ]}
                    >
                      {isChecked && (
                        <Ionicons name="checkmark" size={16} color={colors.text} />
                      )}
                    </View>
                  </View>

                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>
                        {item.title}
                        {item.critical && (
                          <Text style={styles.criticalBadge}> ⚠️</Text>
                        )}
                      </Text>
                    </View>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <View style={styles.warningHeader}>
            <Ionicons name="alert-circle" size={24} color={colors.warning} />
            <Text style={styles.warningTitle}>Important Reminder</Text>
          </View>
          <Text style={styles.warningText}>
            This checklist is a guide for manual verification. Always conduct thorough research
            and never invest more than you can afford to lose. No investment is 100% safe.
          </Text>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  resetButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  progressCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressGradient: {
    padding: spacing.lg,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressScore: {
    fontSize: typography.fontSize.huge * 1.5,
    fontWeight: typography.fontWeight.bold,
  },
  progressLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  progressStat: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  checklistItem: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checklistItemChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  checkboxContainer: {
    paddingTop: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  criticalBadge: {
    fontSize: typography.fontSize.sm,
  },
  itemDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: colors.warning + '20',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning + '40',
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
