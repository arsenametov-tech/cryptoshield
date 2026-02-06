import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ConfettiPieceProps {
  delay: number;
  startX: number;
  color: string;
  duration: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ delay, startX, color, duration }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Fade in and scale up
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.5)) }));

    // Fall down
    translateY.value = withDelay(
      delay,
      withTiming(800, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    );

    // Swing horizontally
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + (Math.random() - 0.5) * 100, {
            duration: duration / 3,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(startX + (Math.random() - 0.5) * 100, {
            duration: duration / 3,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        3,
        false
      )
    );

    // Rotate
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360 * (Math.random() > 0.5 ? 1 : -1), {
          duration: duration / 2,
          easing: Easing.linear,
        }),
        2,
        false
      )
    );

    // Fade out near the end
    opacity.value = withDelay(
      delay + duration - 500,
      withTiming(0, { duration: 500 })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, startX, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.confettiPiece, animatedStyle]}>
      <View style={[styles.confettiShape, { backgroundColor: color }]} />
    </Animated.View>
  );
};

interface ConfettiAnimationProps {
  visible: boolean;
  onComplete?: () => void;
  duration?: number;
  count?: number;
}

const CONFETTI_COLORS = [
  '#00ff88', // Primary green
  '#00b8ff', // Cyan
  '#a78bfa', // Purple
  '#ff8c00', // Orange
  '#f72585', // Pink
  '#9d4edd', // Violet
  '#ffd60a', // Gold
];

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  visible,
  onComplete,
  duration = 3000,
  count = 30,
}) => {
  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration + 500);

      return () => clearTimeout(timer);
    }
  }, [visible, onComplete, duration]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Glow effect */}
      <LinearGradient
        colors={['rgba(0, 255, 136, 0.3)', 'rgba(167, 139, 250, 0.3)', 'rgba(0, 255, 136, 0.3)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glowOverlay}
      />

      {/* Confetti pieces */}
      {Array.from({ length: count }).map((_, index) => (
        <ConfettiPiece
          key={index}
          delay={Math.random() * 500}
          startX={Math.random() * 400 - 200}
          color={CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]}
          duration={duration + Math.random() * 1000 - 500}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  confettiPiece: {
    position: 'absolute',
    top: '40%',
  },
  confettiShape: {
    width: 10,
    height: 10,
    borderRadius: 2,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
