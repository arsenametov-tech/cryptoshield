import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { StorageService } from '@/services/storage';
import { useTextGeneration } from '@fastshot/ai';
import { HapticsService } from '@/services/haptics';
import { ShimmerBadge } from '@/components/ShimmerBadge';
import { LabeledSkeletonLoader } from '@/components/SkeletonLoader';
import { AnimatedPressable, AnimatedCard, AnimatedIconButton, AnimatedButton } from '@/components/AnimatedPressable';
import { t } from '@/services/i18n';
import { useTelegram } from '@/contexts/TelegramContext';
import { TelegramService } from '@/services/telegram';

const { width } = Dimensions.get('window');
const RADAR_SIZE = width * 0.6;

interface RecentCheck {
  id: string;
  name: string;
  status: 'safe' | 'critical' | 'warning';
  score: string;
}

const RECENT_CHECKS: RecentCheck[] = [
  {
    id: '1',
    name: 'SafeMoon V3',
    status: 'safe',
    score: 'SAFE - 7/100',
  },
  {
    id: '2',
    name: 'Ponzicift',
    status: 'critical',
    score: 'CRITICAL - 98/100',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [contractAddress, setContractAddress] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [securityTip, setSecurityTip] = useState<string>('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [scansRemaining, setScansRemaining] = useState(3);

  const { generateText } = useTextGeneration();

  // Telegram integration
  const isInTelegram = Platform.OS === 'web' && TelegramService.isInTelegram();
  const telegram = useTelegram();

  const rotation = useSharedValue(0);
  const radarScale = useSharedValue(1);
  const scanButtonPulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulsing animation for scan button
    scanButtonPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    loadSecurityTip();
    loadSubscriptionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup Telegram Main Button for scanning
  useEffect(() => {
    if (!isInTelegram || !telegram) return;

    const hasInput = contractAddress.trim() || websiteUrl.trim();

    if (hasInput && !isScanning) {
      telegram.showMainButton(t('dashboard.tapToScan'), handleScan);
    } else {
      telegram.hideMainButton();
    }

    return () => {
      if (telegram) {
        telegram.hideMainButton();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress, websiteUrl, isScanning, isInTelegram]);

  const loadSubscriptionStatus = async () => {
    const { scansRemaining: remaining, isPro: proStatus } = await import('@/services/subscription').then(
      m => m.SubscriptionService.canScan()
    );
    setIsPro(proStatus);
    setScansRemaining(remaining);
  };

  const loadSecurityTip = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cached = await StorageService.getSecurityTip();

      // Check if we have a cached tip from today
      if (cached && cached.date === today) {
        setSecurityTip(cached.tip);
        return;
      }

      // Generate new tip using Newell AI with Russian prompt
      setIsLoadingTip(true);

      const response = await generateText('Сгенерируй короткий, практичный совет по крипто-безопасности (максимум 100 слов). Сфокусируйся на темах вроде фишинга, rug pull\'ов, рисков смарт-контрактов, безопасности кошельков или социальной инженерии. Сделай его практичным и простым для понимания крипто-пользователей. Ответь на русском языке.');

      const tip = response || 'Всегда проверяйте адреса контрактов перед транзакциями и никогда не делитесь своими приватными ключами.';
      setSecurityTip(tip);
      await StorageService.saveSecurityTip(tip);
    } catch (error) {
      console.error('Error loading security tip:', error);
      setSecurityTip('Всегда проверяйте адреса контрактов перед транзакциями и никогда не делитесь своими приватными ключами.');
    } finally {
      setIsLoadingTip(false);
    }
  };

  const handleScan = async () => {
    if (!contractAddress.trim() && !websiteUrl.trim()) {
      HapticsService.warning();
      return; // Need at least one input
    }

    // Check if user can scan (Pro or has scans remaining)
    const { canScan, isPro } = await import('@/services/subscription').then(
      m => m.SubscriptionService.canScan()
    );

    if (!canScan && !isPro) {
      // Show upgrade screen
      HapticsService.medium();
      router.push('/premium');
      return;
    }

    // Heavy haptic feedback for scan initiation
    HapticsService.heavy();
    setIsScanning(true);

    // Increment scan count for free users
    if (!isPro) {
      await import('@/services/subscription').then(
        m => m.SubscriptionService.incrementScanCount()
      );
    }

    // Speed up radar animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 800,
        easing: Easing.linear,
      }),
      3,
      false
    );

    // Pulse effect
    radarScale.value = withSequence(
      withTiming(1.1, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );

    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false);
      HapticsService.success();
      const addressToScan = contractAddress.trim() || websiteUrl.trim();
      router.push({
        pathname: '/scan-results',
        params: { address: addressToScan },
      });
    }, 2000);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const radarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: radarScale.value }],
    };
  });

  const scanButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scanButtonPulse.value }],
    };
  });

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          <Text style={styles.headerTitle}>
            Crypto<Text style={styles.headerTitleAccent}>shield</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          {!isPro && (
            <AnimatedPressable
              onPress={() => {
                router.push('/premium');
              }}
              hapticType="medium"
              scaleOnPress={0.95}
            >
              <ShimmerBadge text={t('common.pro')} icon="star" compact />
            </AnimatedPressable>
          )}
          {isPro && (
            <ShimmerBadge text={t('common.pro')} icon="shield-checkmark" compact />
          )}
          <AnimatedIconButton
            style={styles.settingsButton}
            onPress={() => {
              router.push('/settings');
            }}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </AnimatedIconButton>
        </View>
      </View>

      {/* Scan Counter for Free Users */}
      {!isPro && scansRemaining >= 0 && (
        <View style={styles.scanCounterContainer}>
          <BlurView intensity={20} tint="dark" style={styles.scanCounter}>
            <Ionicons name="scan" size={20} color={colors.primary} />
            <Text style={styles.scanCounterText}>
              {t('dashboard.scansRemaining', { count: scansRemaining })}
            </Text>
            <AnimatedPressable onPress={() => router.push('/premium')} scaleOnPress={0.94}>
              <Text style={styles.scanCounterUpgrade}>{t('common.upgrade')}</Text>
            </AnimatedPressable>
          </BlurView>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Radar Scanner */}
        <View style={styles.radarContainer}>
          <Animated.View style={[radarAnimatedStyle]}>
            <View style={styles.radarCircle}>
              {/* Concentric circles */}
              <View style={[styles.circle, styles.circle1]} />
              <View style={[styles.circle, styles.circle2]} />
              <View style={[styles.circle, styles.circle3]} />

              {/* Rotating sweep */}
              <Animated.View style={[styles.radarSweep, animatedStyle]}>
                <LinearGradient
                  colors={['rgba(0, 255, 200, 0)', 'rgba(0, 255, 200, 0.5)']}
                  start={{ x: 0.5, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.sweepGradient}
                />
              </Animated.View>

              {/* Center Icon */}
              <View style={styles.centerIcon}>
                {isScanning ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  <Ionicons name="finger-print" size={48} color={colors.primary} />
                )}
              </View>
            </View>
          </Animated.View>

          {/* Tap to Scan - Only show if not in Telegram (Telegram uses Main Button) */}
          {!isInTelegram && (
            <Animated.View style={scanButtonAnimatedStyle}>
              <AnimatedButton
                style={styles.scanButton}
                onPress={handleScan}
                disabled={isScanning || (!contractAddress.trim() && !websiteUrl.trim())}
                scaleOnPress={0.94}
                hapticType="heavy"
              >
                <Text style={styles.scanButtonText}>
                  {isScanning ? t('dashboard.scanning') : t('dashboard.tapToScan')}
                </Text>
              </AnimatedButton>
            </Animated.View>
          )}
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t('dashboard.inputContract')}
              placeholderTextColor={colors.textMuted}
              value={contractAddress}
              onChangeText={setContractAddress}
              editable={!isScanning}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t('dashboard.inputWebsite')}
              placeholderTextColor={colors.textMuted}
              value={websiteUrl}
              onChangeText={setWebsiteUrl}
              editable={!isScanning}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        </View>

        {/* Security Tip of the Day */}
        <View style={styles.tipSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.securityTipTitle')}</Text>
            <View style={styles.aiPoweredBadge}>
              <Ionicons name="sparkles" size={12} color={colors.primary} />
              <Text style={styles.aiPoweredText}>{t('dashboard.aiPowered')}</Text>
            </View>
          </View>

          <AnimatedCard
            onPress={() => {
              // Optional: Add action when tapping tip card
            }}
            disabled={isLoadingTip}
            scaleOnPress={0.985}
          >
            <BlurView intensity={30} tint="dark" style={styles.tipCard}>
              <LinearGradient
                colors={[`${colors.primary}22`, `${colors.primary}08`, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipGradient}
              >
              <View style={styles.tipHeader}>
                <View style={styles.tipIconContainer}>
                  <LinearGradient
                    colors={[`${colors.primary}44`, `${colors.primary}22`]}
                    style={styles.tipIconGradient}
                  >
                    <Ionicons name="bulb" size={28} color={colors.primary} />
                  </LinearGradient>
                </View>
                <View style={styles.tipHeaderContent}>
                  <Text style={styles.tipLabel}>Daily Security Insight</Text>
                  <Text style={styles.tipSubLabel}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>

              {isLoadingTip ? (
                <View style={styles.tipLoadingContainer}>
                  <LabeledSkeletonLoader label="thinking" size={40} />
                </View>
              ) : (
                <View style={styles.tipContentContainer}>
                  <View style={styles.tipQuoteMark}>
                    <Text style={styles.quoteText}>&ldquo;</Text>
                  </View>
                  <Text style={styles.tipText}>{securityTip}</Text>
                </View>
              )}

              {/* Decorative gradient border */}
              <View style={styles.tipBorderGlow} />
            </LinearGradient>
            </BlurView>
          </AnimatedCard>
        </View>

        {/* Recent Checks */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>{t('dashboard.recentChecks')}</Text>

          <View style={styles.recentChecksGrid}>
            {RECENT_CHECKS.map((check) => (
              <AnimatedCard
                key={check.id}
                style={[
                  styles.recentCheckCard,
                  { borderColor: getStatusColor(check.status) },
                ]}
                onPress={() => router.push({
                  pathname: '/scan-results',
                  params: { address: check.name },
                })}
              >
                <Ionicons
                  name={getStatusIcon(check.status)}
                  size={32}
                  color={getStatusColor(check.status)}
                />
                <Text style={styles.recentCheckName}>{check.name}</Text>
                <Text
                  style={[
                    styles.recentCheckScore,
                    { color: getStatusColor(check.status) },
                  ]}
                >
                  {check.score}
                </Text>
              </AnimatedCard>
            ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerTitleAccent: {
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  scanCounterContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  scanCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  scanCounterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  scanCounterUpgrade: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  radarContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  radarCircle: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: RADAR_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.primary,
    opacity: 0.3,
  },
  circle1: {
    width: RADAR_SIZE * 0.4,
    height: RADAR_SIZE * 0.4,
  },
  circle2: {
    width: RADAR_SIZE * 0.65,
    height: RADAR_SIZE * 0.65,
  },
  circle3: {
    width: RADAR_SIZE * 0.9,
    height: RADAR_SIZE * 0.9,
  },
  radarSweep: {
    position: 'absolute',
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
  },
  sweepGradient: {
    flex: 1,
    borderRadius: RADAR_SIZE / 2,
  },
  centerIcon: {
    zIndex: 10,
  },
  scanButton: {
    marginTop: spacing.lg,
  },
  scanButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 2,
  },
  inputContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  tipSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  aiPoweredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
  },
  aiPoweredText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  tipCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: `${colors.primary}22`,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  tipGradient: {
    padding: spacing.lg,
    position: 'relative',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  tipIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  tipIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${colors.primary}44`,
    borderRadius: 28,
  },
  tipHeaderContent: {
    flex: 1,
  },
  tipLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  tipSubLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  tipLoadingContainer: {
    paddingVertical: spacing.md,
  },
  tipContentContainer: {
    position: 'relative',
  },
  tipQuoteMark: {
    position: 'absolute',
    top: -8,
    left: -8,
    opacity: 0.2,
  },
  quoteText: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    lineHeight: 48,
  },
  tipText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 24,
    paddingLeft: spacing.md,
  },
  tipBorderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  recentSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  recentChecksGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  recentCheckCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  recentCheckName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  recentCheckScore: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
});
