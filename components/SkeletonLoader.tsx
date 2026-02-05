import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export const SkeletonLoader = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) => {
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.5, 0, 0.5, 1),
      }),
      -1,
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmer.value * 400 }],
    };
  });

  return (
    <View style={[styles.skeleton, { width: width as any, height, borderRadius }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            `${colors.primary}22`,
            `${colors.primary}44`,
            `${colors.primary}22`,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
};

// Scanning Animation Component
interface ScanningLoaderProps {
  size?: number;
}

export const ScanningLoader = ({ size = 60 }: ScanningLoaderProps) => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    pulse.value = withRepeat(
      withTiming(1.2, {
        duration: 1000,
        easing: Easing.bezier(0.5, 0, 0.5, 1),
      }),
      -1,
      true
    );
  }, [rotation, pulse]);

  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: 2 - pulse.value,
    };
  });

  return (
    <View style={[styles.scanningContainer, { width: size, height: size }]}>
      {/* Outer pulse ring */}
      <Animated.View style={[styles.pulseRing, pulseStyle]}>
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: colors.primary,
            },
          ]}
        />
      </Animated.View>

      {/* Rotating scanner */}
      <Animated.View style={[styles.scanner, rotationStyle]}>
        <LinearGradient
          colors={['transparent', `${colors.primary}88`, colors.primary]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.scannerGradient,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: (size * 0.7) / 2,
            },
          ]}
        />
      </Animated.View>

      {/* Center dot */}
      <View style={styles.centerDot}>
        <View
          style={[
            styles.dot,
            {
              width: size * 0.2,
              height: size * 0.2,
              borderRadius: (size * 0.2) / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

// Message skeleton for chat loading
export const MessageSkeleton = () => {
  return (
    <View style={styles.messageSkeleton}>
      <SkeletonLoader width={32} height={32} borderRadius={16} />
      <View style={styles.messageContent}>
        <SkeletonLoader width="90%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="70%" height={16} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  shimmerGradient: {
    flex: 1,
    width: 400,
  },
  scanningContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
  },
  ring: {
    borderWidth: 2,
  },
  scanner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  messageSkeleton: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  messageContent: {
    flex: 1,
  },
});
