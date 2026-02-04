import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
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

  const { generateText } = useTextGeneration();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSecurityTip = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cached = await StorageService.getSecurityTip();

      // Check if we have a cached tip from today
      if (cached && cached.date === today) {
        setSecurityTip(cached.tip);
        return;
      }

      // Generate new tip using Newell AI
      setIsLoadingTip(true);

      const response = await generateText('Generate a short, practical crypto security tip (max 100 words). Focus on topics like phishing, rug pulls, smart contract risks, wallet security, or social engineering. Make it actionable and easy to understand for crypto users.');

      const tip = response || 'Always verify contract addresses before transactions and never share your private keys.';
      setSecurityTip(tip);
      await StorageService.saveSecurityTip(tip);
    } catch (error) {
      console.error('Error loading security tip:', error);
      setSecurityTip('Always verify contract addresses before transactions and never share your private keys.');
    } finally {
      setIsLoadingTip(false);
    }
  };

  const handleScan = async () => {
    if (!contractAddress.trim() && !websiteUrl.trim()) {
      return; // Need at least one input
    }

    setIsScanning(true);

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
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

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

          {/* Tap to Scan */}
          <Animated.View style={scanButtonAnimatedStyle}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScan}
              disabled={isScanning || (!contractAddress.trim() && !websiteUrl.trim())}
            >
              <Text style={styles.scanButtonText}>
                {isScanning ? 'SCANNING...' : 'TAP TO SCAN'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter Contract Address (0x...)"
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
              placeholder="Check Website URL"
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
          <Text style={styles.sectionTitle}>Security Tip of the Day</Text>

          <BlurView intensity={20} tint="dark" style={styles.tipCard}>
            <LinearGradient
              colors={[`${colors.primary}15`, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tipGradient}
            >
              <View style={styles.tipHeader}>
                <View style={styles.tipIconContainer}>
                  <Ionicons name="bulb" size={24} color={colors.primary} />
                </View>
                <Text style={styles.tipLabel}>Daily Tip</Text>
              </View>

              {isLoadingTip ? (
                <View style={styles.tipLoadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.tipLoadingText}>Loading today&apos;s tip...</Text>
                </View>
              ) : (
                <Text style={styles.tipText}>{securityTip}</Text>
              )}
            </LinearGradient>
          </BlurView>
        </View>

        {/* Recent Checks */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Checks</Text>

          <View style={styles.recentChecksGrid}>
            {RECENT_CHECKS.map((check) => (
              <TouchableOpacity
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
              </TouchableOpacity>
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
  settingsButton: {
    padding: spacing.sm,
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
  tipCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipGradient: {
    padding: spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  tipLoadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  tipText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 22,
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
