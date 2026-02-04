import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface LearnTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const LEARN_TOPICS: LearnTopic[] = [
  {
    id: '1',
    title: 'Honeypot Scams',
    description: 'Learn how honeypot contracts trap investors',
    icon: 'warning',
  },
  {
    id: '2',
    title: 'Rug Pulls',
    description: 'Understand liquidity removal attacks',
    icon: 'flash',
  },
  {
    id: '3',
    title: 'Fake Tokens',
    description: 'Identify counterfeit cryptocurrency tokens',
    icon: 'copy',
  },
  {
    id: '4',
    title: 'Social Engineering',
    description: 'Recognize phishing and social manipulation',
    icon: 'people',
  },
  {
    id: '5',
    title: 'Smart Contract Risks',
    description: 'Common vulnerabilities in blockchain code',
    icon: 'code-slash',
  },
  {
    id: '6',
    title: 'Safe Trading Practices',
    description: 'Best practices for secure crypto trading',
    icon: 'shield-checkmark',
  },
];

export default function Learn() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learn Crypto Security</Text>
        <Text style={styles.headerSubtitle}>
          Protect yourself from scams and fraud
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {LEARN_TOPICS.map((topic) => (
          <TouchableOpacity key={topic.id} style={styles.topicCard}>
            <View style={styles.topicIcon}>
              <Ionicons
                name={topic.icon as any}
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.topicContent}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDescription}>{topic.description}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ))}
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
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  topicDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
});
