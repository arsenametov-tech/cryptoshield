import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export default function AIExpert() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Security Expert</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Powered by Newell AI. Detect social engineering and fraud patterns.
        </Text>

        {/* Action Cards */}
        <View style={styles.cardsContainer}>
          {/* Analyze Screenshot Card */}
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.cardIcon}>
              <Ionicons name="image" size={48} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Analyze Screenshot</Text>
            <Text style={styles.cardDescription}>
              Upload chats, ads, or whitepapers. Newell Vision detects red flags.
            </Text>
          </TouchableOpacity>

          {/* Ask AI Consultant Card */}
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.cardIcon}>
              <Ionicons name="chatbubbles" size={48} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Ask AI Consultant</Text>
            <Text style={styles.cardDescription}>
              Unsure about a project? Chat with Newell AI about crypto risks.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            Built-in Newell AI{'\n'}(No API keys required)
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: spacing.lg,
  },
  actionCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBanner: {
    marginTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  infoBannerText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
