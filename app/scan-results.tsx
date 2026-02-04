import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const GAUGE_SIZE = width * 0.55;

interface SecurityCheck {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
}

export default function ScanResults() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Parse the contract address from params
  const contractAddress = params.address as string || 'Unknown';

  // Mock risk calculation based on address
  const calculateRiskScore = (address: string): number => {
    // Simple mock: use address hash to generate a score
    if (!address || address === 'Unknown') return 75;
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Math.min(100, Math.max(5, hash % 100));
  };

  const riskScore = calculateRiskScore(contractAddress);

  // Security checks based on risk score
  const securityChecks: SecurityCheck[] = [
    {
      id: '1',
      name: 'Honeypot Test',
      status: riskScore > 70 ? 'fail' : 'pass',
      description: riskScore > 70 ? 'Cannot sell tokens' : 'Tokens can be sold',
    },
    {
      id: '2',
      name: 'Liquidity Lock',
      status: riskScore > 60 ? 'fail' : riskScore > 40 ? 'warning' : 'pass',
      description: riskScore > 60 ? 'Liquidity unlocked' : riskScore > 40 ? 'Partial lock detected' : 'Liquidity locked',
    },
    {
      id: '3',
      name: 'Contract Audit',
      status: riskScore > 50 ? 'warning' : 'pass',
      description: riskScore > 50 ? 'No audit found' : 'Contract verified',
    },
    {
      id: '4',
      name: 'Ownership',
      status: riskScore > 80 ? 'fail' : riskScore > 50 ? 'warning' : 'pass',
      description: riskScore > 80 ? 'Owner can mint' : riskScore > 50 ? 'Ownership not renounced' : 'Ownership renounced',
    },
    {
      id: '5',
      name: 'Top Holders',
      status: riskScore > 75 ? 'fail' : 'pass',
      description: riskScore > 75 ? 'High rugpull risk' : 'Distributed holdings',
    },
  ];

  const getRiskLevel = (score: number): { level: string; color: string; gradient: string[] } => {
    if (score >= 70) {
      return {
        level: 'CRITICAL RISK',
        color: colors.danger,
        gradient: ['#ff3366', '#cc0033'],
      };
    } else if (score >= 40) {
      return {
        level: 'MODERATE RISK',
        color: colors.warning,
        gradient: ['#ffaa00', '#ff8800'],
      };
    } else {
      return {
        level: 'LOW RISK',
        color: colors.success,
        gradient: ['#00ff88', '#00dd66'],
      };
    }
  };

  const riskInfo = getRiskLevel(riskScore);

  // Generate AI summary based on checks
  const generateAISummary = (): string => {
    const failedChecks = securityChecks.filter(c => c.status === 'fail').length;
    const warningChecks = securityChecks.filter(c => c.status === 'warning').length;

    if (failedChecks >= 3) {
      return "⚠️ CRITICAL WARNING: This contract exhibits multiple red flags including honeypot behavior and unlocked liquidity. High probability of scam. Do not interact with this contract.";
    } else if (failedChecks >= 1 || warningChecks >= 2) {
      return "⚠️ CAUTION: This contract shows concerning patterns. Potential risks detected in liquidity management and ownership structure. Proceed with extreme caution or avoid entirely.";
    } else if (warningChecks >= 1) {
      return "⚠️ MODERATE RISK: Some minor concerns detected. While not immediately dangerous, exercise caution and only invest what you can afford to lose.";
    } else {
      return "✓ This contract appears relatively safe based on automated analysis. However, always do your own research before investing.";
    }
  };

  const aiSummary = generateAISummary();

  // Animations
  const gaugeRotation = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);
  const checksScale = useSharedValue(0.8);

  useEffect(() => {
    // Animate gauge
    gaugeRotation.value = withTiming(riskScore / 100, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });

    // Fade in score
    scoreOpacity.value = withTiming(1, { duration: 1000 });

    // Scale in checks
    checksScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });
  }, []);

  const gaugeStyle = useAnimatedStyle(() => {
    const rotation = gaugeRotation.value * 180 - 90; // -90 to 90 degrees
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const scoreStyle = useAnimatedStyle(() => {
    return {
      opacity: scoreOpacity.value,
    };
  });

  const checksStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checksScale.value }],
      opacity: checksScale.value,
    };
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return 'checkmark-circle';
      case 'fail':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return colors.success;
      case 'fail':
        return colors.danger;
      case 'warning':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contract Address */}
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Contract Address:</Text>
          <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
            {contractAddress}
          </Text>
        </View>

        {/* Risk Score Gauge */}
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeCircle}>
            {/* Background arc */}
            <View style={styles.arcBackground} />

            {/* Animated arc */}
            <Animated.View style={[styles.arcContainer, gaugeStyle]}>
              <LinearGradient
                colors={riskInfo.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.arc}
              />
            </Animated.View>

            {/* Center content */}
            <Animated.View style={[styles.scoreContent, scoreStyle]}>
              <Text style={[styles.scoreNumber, { color: riskInfo.color }]}>
                {riskScore}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
              <Text style={[styles.riskLevel, { color: riskInfo.color }]}>
                {riskInfo.level}
              </Text>
            </Animated.View>
          </View>

          {riskScore >= 70 && (
            <View style={styles.scamBadge}>
              <Text style={styles.scamBadgeText}>⚠️ SCAM DETECTED</Text>
            </View>
          )}
        </View>

        {/* AI Executive Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
            <Text style={styles.summaryTitle}>AI Executive Summary</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{aiSummary}</Text>
          </View>
        </View>

        {/* Security Checks */}
        <View style={styles.checksSection}>
          <Text style={styles.sectionTitle}>Security Checks</Text>

          <Animated.View style={checksStyle}>
            {securityChecks.map((check) => (
              <View
                key={check.id}
                style={[
                  styles.checkCard,
                  { borderLeftColor: getStatusColor(check.status) },
                ]}
              >
                <View style={styles.checkHeader}>
                  <Ionicons
                    name={getStatusIcon(check.status)}
                    size={24}
                    color={getStatusColor(check.status)}
                  />
                  <Text style={styles.checkName}>{check.name}</Text>
                </View>
                <Text style={styles.checkDescription}>{check.description}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Action Button */}
        {riskScore >= 70 && (
          <TouchableOpacity style={styles.blockButton}>
            <LinearGradient
              colors={[colors.danger, colors.dangerDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.blockButtonGradient}
            >
              <Ionicons name="ban" size={20} color={colors.text} />
              <Text style={styles.blockButtonText}>BLOCK & DELETE</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  addressContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  addressLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  addressText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    fontFamily: 'monospace',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  gaugeCircle: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  arcBackground: {
    position: 'absolute',
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
    borderWidth: 12,
    borderColor: colors.backgroundSecondary,
  },
  arcContainer: {
    position: 'absolute',
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
  },
  arc: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
    borderWidth: 12,
    borderColor: 'transparent',
    borderTopColor: colors.danger,
    borderRightColor: colors.danger,
  },
  scoreContent: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: typography.fontSize.huge * 1.5,
    fontWeight: typography.fontWeight.bold,
  },
  scoreMax: {
    fontSize: typography.fontSize.xl,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  riskLevel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  scamBadge: {
    marginTop: spacing.lg,
    backgroundColor: colors.danger,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  scamBadgeText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: 1,
  },
  summarySection: {
    marginBottom: spacing.xxl,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  summaryCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  summaryText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  checksSection: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  checkCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  checkName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  checkDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.lg + 8,
  },
  blockButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  blockButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  blockButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: 1,
  },
});
