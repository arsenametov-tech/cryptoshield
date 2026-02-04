import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scamDetails } from '@/data/scamDetails';

export default function ScamDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const scam = scamDetails[id as string];

  if (!scam) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.danger} />
          <Text style={styles.errorText}>Scam information not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={scam.gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroIcon}>
              <Ionicons
                name={scam.icon as any}
                size={48}
                color={colors.text}
              />
            </View>
            <Text style={styles.heroTitle}>{scam.title}</Text>
            <View style={styles.warningBadge}>
              <Ionicons name="shield-half" size={16} color={colors.text} />
              <Text style={styles.warningBadgeText}>HIGH RISK THREAT</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is it?</Text>
          <Text style={styles.descriptionText}>{scam.description}</Text>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={20} color={scam.color} />
            <Text style={styles.sectionTitle}>How It Works</Text>
          </View>
          <View style={styles.listContainer}>
            {scam.howItWorks.map((step, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.stepNumber, { backgroundColor: scam.color + '20' }]}>
                  <Text style={[styles.stepNumberText, { color: scam.color }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Red Flags */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={20} color={colors.danger} />
            <Text style={styles.sectionTitle}>Red Flags</Text>
          </View>
          <View style={styles.listContainer}>
            {scam.redFlags.map((flag, index) => (
              <View key={index} style={styles.redFlagItem}>
                <Ionicons
                  name="warning"
                  size={20}
                  color={colors.danger}
                  style={styles.bulletIcon}
                />
                <Text style={styles.listText}>{flag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expert Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={styles.sectionTitle}>Expert Protection Tips</Text>
          </View>
          <View style={styles.listContainer}>
            {scam.expertTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                  style={styles.bulletIcon}
                />
                <Text style={styles.listText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Real Example */}
        {scam.realExample && (
          <View style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <Ionicons name="document-text" size={20} color={colors.warning} />
              <Text style={styles.exampleTitle}>Real-World Example</Text>
            </View>
            <Text style={styles.exampleText}>{scam.realExample}</Text>
          </View>
        )}

        {/* Bottom CTA */}
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push('/security-checklist')}
        >
          <View style={styles.ctaContent}>
            <View style={styles.ctaIcon}>
              <Ionicons name="checkmark-done" size={24} color={colors.primary} />
            </View>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>Verify Before You Invest</Text>
              <Text style={styles.ctaDescription}>
                Use our Security Checklist to manually audit projects
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>
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
  headerBackButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  heroGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.fontSize.xxl * 1.2,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  warningBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  descriptionText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  listContainer: {
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  redFlagItem: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.danger + '10',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.danger + '30',
    padding: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.success + '10',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success + '30',
    padding: spacing.md,
  },
  bulletIcon: {
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  exampleCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  exampleTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  exampleText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  ctaCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ctaIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ctaDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
});
