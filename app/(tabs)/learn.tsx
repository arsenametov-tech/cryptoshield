import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScamType {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: string[];
}

const SCAM_TYPES: ScamType[] = [
  {
    id: 'rugpull',
    title: 'Rug Pulls',
    description: 'Learn about liquidity removal scams',
    icon: 'flash',
    color: colors.danger,
    gradient: ['#ff3366', '#cc0033'],
  },
  {
    id: 'honeypot',
    title: 'Honeypot Traps',
    description: 'Contracts that prevent selling tokens',
    icon: 'warning',
    color: colors.warning,
    gradient: ['#ffaa00', '#ff8800'],
  },
  {
    id: 'phishing',
    title: 'Phishing Attacks',
    description: 'Social engineering and fake websites',
    icon: 'fish',
    color: '#3b82f6',
    gradient: ['#3b82f6', '#2563eb'],
  },
  {
    id: 'dusting',
    title: 'Dusting Attacks',
    description: 'Tracking wallets via dust amounts',
    icon: 'sparkles',
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#7c3aed'],
  },
  {
    id: 'pump-dump',
    title: 'Pump & Dump',
    description: 'Coordinated price manipulation',
    icon: 'trending-up',
    color: '#f59e0b',
    gradient: ['#f59e0b', '#d97706'],
  },
  {
    id: 'fake-tokens',
    title: 'Fake Tokens',
    description: 'Counterfeit cryptocurrency tokens',
    icon: 'copy',
    color: '#ef4444',
    gradient: ['#ef4444', '#dc2626'],
  },
];

export default function Learn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View>
          <Text style={styles.headerTitle}>Security Center</Text>
          <Text style={styles.headerSubtitle}>
            Master crypto security • Avoid scams
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Checklist Card */}
        <TouchableOpacity
          style={styles.checklistCard}
          onPress={() => router.push('/security-checklist')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.checklistGradient}
          >
            <View style={styles.checklistIcon}>
              <Ionicons name="checkmark-done-circle" size={32} color={colors.text} />
            </View>
            <View style={styles.checklistContent}>
              <Text style={styles.checklistTitle}>Security Checklist</Text>
              <Text style={styles.checklistDescription}>
                Interactive manual verification tool
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={colors.text} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Scam Library Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Threat Library</Text>
          <Text style={styles.sectionSubtitle}>
            Learn about common crypto scams and how to avoid them
          </Text>

          <View style={styles.scamGrid}>
            {SCAM_TYPES.map((scam) => (
              <TouchableOpacity
                key={scam.id}
                style={styles.scamCard}
                onPress={() => router.push(`/learn/${scam.id}` as any)}
              >
                <View style={[styles.scamIconContainer, { backgroundColor: scam.color + '20' }]}>
                  <Ionicons name={scam.icon} size={32} color={scam.color} />
                </View>
                <Text style={styles.scamTitle}>{scam.title}</Text>
                <Text style={styles.scamDescription}>{scam.description}</Text>
                <View style={styles.scamFooter}>
                  <Text style={[styles.learnMore, { color: scam.color }]}>
                    Learn more
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={scam.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pro Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsSectionHeader}>
            <Ionicons name="bulb" size={20} color={colors.warning} />
            <Text style={styles.tipsSectionTitle}>Pro Security Tips</Text>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>1</Text>
            </View>
            <Text style={styles.tipText}>
              Never share your private keys or seed phrases with anyone
            </Text>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>2</Text>
            </View>
            <Text style={styles.tipText}>
              Always verify contract addresses on multiple sources
            </Text>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>3</Text>
            </View>
            <Text style={styles.tipText}>
              Be wary of guaranteed returns or "too good to be true" offers
            </Text>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>4</Text>
            </View>
            <Text style={styles.tipText}>
              Check liquidity locks and audit reports before investing
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 80,
  },
  checklistCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  checklistGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  checklistIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  checklistDescription: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  scamGrid: {
    gap: spacing.md,
  },
  scamCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  scamIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scamTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  scamDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  scamFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  learnMore: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  tipsSection: {
    marginBottom: spacing.lg,
  },
  tipsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  tipCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
