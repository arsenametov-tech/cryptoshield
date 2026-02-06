import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface ShimmerBadgeProps {
  text?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  compact?: boolean;
}

export const ShimmerBadge = ({
  text = 'Pro',
  icon = 'star',
  style,
  compact = false,
}: ShimmerBadgeProps) => {
  const shimmer = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Shimmer animation
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 2500,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulse animation
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, {
          duration: 1500,
          easing: Easing.bezier(0.5, 0, 0.5, 1),
        }),
        withTiming(1, {
          duration: 1500,
          easing: Easing.bezier(0.5, 0, 0.5, 1),
        })
      ),
      -1,
      false
    );
  }, [shimmer, pulse]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmer.value * 200 - 100 }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, compact && styles.containerCompact, style, pulseStyle]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, compact && styles.gradientCompact]}
      >
        <View style={styles.content}>
          <Ionicons
            name={icon}
            size={compact ? 14 : 16}
            color={colors.background}
          />
          <Text style={[styles.text, compact && styles.textCompact]}>{text}</Text>
        </View>

        {/* Shimmer overlay */}
        <View style={styles.shimmerContainer}>
          <Animated.View style={[styles.shimmer, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Shimmer effect for upgrade buttons
interface ShimmerButtonProps {
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export const ShimmerUpgradeButton = ({
  text,
  icon = 'arrow-forward',
  style,
}: ShimmerButtonProps) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmer.value * 400 - 200 }],
    };
  });

  return (
    <View style={[styles.buttonContainer, style]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonGradient}
      >
        <Text style={styles.buttonText}>{text}</Text>
        {icon && (
          <Ionicons name={icon} size={20} color={colors.background} />
        )}

        {/* Shimmer overlay */}
        <View style={styles.buttonShimmerContainer}>
          <Animated.View style={[styles.buttonShimmer, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  containerCompact: {
    shadowRadius: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  gradientCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    zIndex: 1,
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
  textCompact: {
    fontSize: typography.fontSize.xs,
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmer: {
    width: 100,
    height: '100%',
  },
  shimmerGradient: {
    flex: 1,
  },
  buttonContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
    position: 'relative',
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
    zIndex: 1,
  },
  buttonShimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  buttonShimmer: {
    width: 200,
    height: '100%',
  },
});
