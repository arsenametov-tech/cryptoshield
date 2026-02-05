import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { StorageService, UserPreferences } from '@/services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { HapticsService } from '@/services/haptics';
import { AnimatedIconButton, AnimatedCard, AnimatedButton, AnimatedPressable } from '@/components/AnimatedPressable';

export default function SettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences>({
    dailyNotifications: true,
    securityAlerts: true,
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkProStatus();
  }, []);

  const checkProStatus = async () => {
    try {
      const { SubscriptionService } = await import('@/services/subscription');
      const proStatus = await SubscriptionService.isPro();
      setIsPro(proStatus);
    } catch (error) {
      console.error('Error checking Pro status:', error);
    }
  };

  const loadPreferences = async () => {
    const prefs = await StorageService.getPreferences();
    setPreferences(prefs);
  };

  const handleToggleNotifications = async (value: boolean) => {
    HapticsService.selection();
    const updated = { ...preferences, dailyNotifications: value };
    setPreferences(updated);
    await StorageService.savePreferences(updated);
  };

  const handleToggleAlerts = async (value: boolean) => {
    HapticsService.selection();
    const updated = { ...preferences, securityAlerts: value };
    setPreferences(updated);
    await StorageService.savePreferences(updated);
  };

  const handleSaveName = async () => {
    const updated = { ...preferences, userName: tempName };
    setPreferences(updated);
    await StorageService.savePreferences(updated);
    setIsEditingName(false);
  };

  const handleClearHistory = () => {
    HapticsService.warning();
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scan history? This action cannot be undone.',
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
            Alert.alert('Success', 'Scan history has been cleared.');
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset the onboarding and restart the app. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@cryptoshield_onboarding_complete');
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <AnimatedIconButton style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </AnimatedIconButton>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <BlurView intensity={20} tint="dark" style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.avatar}
                >
                  <Ionicons name="person" size={32} color={colors.background} />
                </LinearGradient>
              </View>
              <View style={styles.profileInfo}>
                {isEditingName ? (
                  <View style={styles.nameEditContainer}>
                    <TextInput
                      style={styles.nameInput}
                      value={tempName}
                      onChangeText={setTempName}
                      placeholder="Enter your name"
                      placeholderTextColor={colors.textMuted}
                      autoFocus
                    />
                    <AnimatedIconButton onPress={handleSaveName} scaleOnPress={0.92}>
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    </AnimatedIconButton>
                  </View>
                ) : (
                  <AnimatedPressable
                    style={styles.nameContainer}
                    onPress={() => {
                      setTempName(preferences.userName || '');
                      setIsEditingName(true);
                    }}
                    scaleOnPress={0.98}
                  >
                    <Text style={styles.userName}>
                      {preferences.userName || 'Set Your Name'}
                    </Text>
                    <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                  </AnimatedPressable>
                )}
                <View style={styles.userRoleContainer}>
                  <Text style={styles.userRole}>
                    {isPro ? 'Cryptoshield Pro Member' : 'Crypto Security User'}
                  </Text>
                  {isPro && (
                    <View style={styles.proBadge}>
                      <Ionicons name="star" size={12} color={colors.primary} />
                    </View>
                  )}
                </View>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Subscription Section */}
        {!isPro && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>

            <AnimatedCard onPress={() => router.push('/premium')} scaleOnPress={0.98} hapticType="medium">
              <BlurView intensity={20} tint="dark" style={styles.upgradeCard}>
                <LinearGradient
                  colors={[`${colors.primary}22`, 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.upgradeCardGradient}
                >
                  <View style={styles.upgradeCardContent}>
                    <View style={styles.upgradeIconContainer}>
                      <Ionicons name="star" size={32} color={colors.primary} />
                    </View>
                    <View style={styles.upgradeTextContainer}>
                      <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                      <Text style={styles.upgradeDescription}>
                        Unlock unlimited scans and advanced features
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                  </View>
                </LinearGradient>
              </BlurView>
            </AnimatedCard>
          </View>
        )}

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications & Alerts</Text>

          <BlurView intensity={20} tint="dark" style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="notifications" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Daily Security Tips</Text>
                  <Text style={styles.settingDescription}>
                    Receive daily crypto safety tips
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.dailyNotifications}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={preferences.dailyNotifications ? colors.primary : colors.textMuted}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="warning" size={20} color={colors.warning} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Security Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Get notified about emerging threats
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.securityAlerts}
                onValueChange={handleToggleAlerts}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={preferences.securityAlerts ? colors.primary : colors.textMuted}
              />
            </View>
          </BlurView>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <BlurView intensity={20} tint="dark" style={styles.card}>
            <AnimatedPressable style={styles.actionRow} onPress={handleClearHistory} scaleOnPress={0.98}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: `${colors.danger}22` }]}>
                  <Ionicons name="trash" size={20} color={colors.danger} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Clear History</Text>
                  <Text style={styles.settingDescription}>
                    Remove all scan history
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </AnimatedPressable>

            <View style={styles.divider} />

            <AnimatedPressable style={styles.actionRow} onPress={handleResetOnboarding} scaleOnPress={0.98}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: `${colors.warning}22` }]}>
                  <Ionicons name="refresh" size={20} color={colors.warning} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Reset Onboarding</Text>
                  <Text style={styles.settingDescription}>
                    View the introduction again
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </AnimatedPressable>
          </BlurView>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <BlurView intensity={20} tint="dark" style={styles.card}>
            <AnimatedPressable style={styles.actionRow} onPress={() => setShowAbout(true)} scaleOnPress={0.98}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: `${colors.primary}22` }]}>
                  <Ionicons name="information-circle" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>About Cryptoshield</Text>
                  <Text style={styles.settingDescription}>
                    Version {appVersion}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </AnimatedPressable>
          </BlurView>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* About Modal */}
      <Modal
        visible={showAbout}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAbout(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.modalIcon}
                  >
                    <Ionicons name="shield-checkmark" size={40} color={colors.background} />
                  </LinearGradient>
                </View>
                <Text style={styles.modalTitle}>Cryptoshield</Text>
                <Text style={styles.modalVersion}>Version {appVersion}</Text>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Cryptoshield is your personal AI-powered security companion for the cryptocurrency world.
                  We help protect you from scams, rug pulls, and malicious projects through advanced scanning and analysis.
                </Text>

                <View style={styles.disclaimerBox}>
                  <View style={styles.disclaimerHeader}>
                    <Ionicons name="alert-circle" size={20} color={colors.warning} />
                    <Text style={styles.disclaimerTitle}>Legal Disclaimer</Text>
                  </View>
                  <Text style={styles.disclaimerText}>
                    Cryptoshield provides educational information and analysis tools. Our assessments should not be considered financial advice.
                    Always conduct your own research and never invest more than you can afford to lose.
                    Cryptocurrency investments carry inherent risks, and past performance does not guarantee future results.
                  </Text>
                </View>

                <Text style={styles.modalFooter}>
                  © 2024 Cryptoshield. All rights reserved.
                </Text>
              </View>

              <AnimatedButton
                onPress={() => setShowAbout(false)}
                scaleOnPress={0.96}
              >
                <View style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </View>
              </AnimatedButton>
            </View>
          </BlurView>
        </View>
      </Modal>
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
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatarContainer: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameInput: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  userRoleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  userRole: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  proBadge: {
    backgroundColor: `${colors.primary}22`,
    borderRadius: borderRadius.full,
    padding: spacing.xs / 2,
  },
  upgradeCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  upgradeCardGradient: {
    padding: spacing.lg,
  },
  upgradeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  upgradeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  upgradeDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBlur: {
    width: '90%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalContent: {
    padding: spacing.xl,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalIconContainer: {
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalVersion: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  modalBody: {
    gap: spacing.lg,
  },
  modalText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  disclaimerBox: {
    backgroundColor: `${colors.warning}11`,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.warning}33`,
    padding: spacing.md,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  disclaimerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
  },
  disclaimerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modalFooter: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  closeButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
});
