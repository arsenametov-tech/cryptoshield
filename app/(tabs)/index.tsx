import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

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
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
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
        <TouchableOpacity style={styles.settingsButton}>
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
              <Ionicons name="finger-print" size={48} color={colors.primary} />
            </View>
          </View>

          {/* Tap to Scan */}
          <TouchableOpacity style={styles.scanButton}>
            <Text style={styles.scanButtonText}>TAP TO SCAN</Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter Contract Address (0x...)"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Check Website URL"
              placeholderTextColor={colors.textMuted}
            />
          </View>
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
