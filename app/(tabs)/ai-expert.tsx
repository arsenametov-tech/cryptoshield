import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { HapticsService } from '@/services/haptics';

export default function AIExpert() {
  const router = useRouter();

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
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              HapticsService.medium();
              router.push('/screenshot-analysis');
            }}
          >
            <LinearGradient
              colors={[`${colors.primary}11`, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="image" size={48} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Analyze Screenshot</Text>
              <Text style={styles.cardDescription}>
                Upload chats, ads, or whitepapers. Newell Vision detects red flags.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Ask AI Consultant Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              HapticsService.medium();
              router.push('/ai-consultant');
            }}
          >
            <LinearGradient
              colors={[`${colors.primary}11`, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="chatbubbles" size={48} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Ask AI Consultant</Text>
              <Text style={styles.cardDescription}>
                Unsure about a project? Chat with Newell AI about crypto risks.
              </Text>
            </LinearGradient>
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
    borderWidth: 2,
    borderColor: `${colors.primary}22`,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardGradient: {
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
